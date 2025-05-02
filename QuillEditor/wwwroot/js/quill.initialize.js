export async function loadScript(url) {
    if (document.querySelector(`script[src="${url}"]`)) return;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function loadStyle(url) {
    if (document.querySelector(`link[href="${url}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

export function isQuillLoaded() {
    return !!window.Quill;
}

export function isEditorInitialized(selector) {
    const el = document.querySelector(selector);
    return !!(el && el.__quill);
}

export function initializeQuill(selector, toolbarselector, maximagewidth, maximageheight) {
    const el = document.querySelector(selector);
    if (!el) {
        console.error(`Element ${selector} not found`);
        return;
    }

    // Überprüfen, ob Quill schon existiert, bevor es erneut initialisiert wird
    if (el.__quill) {
        console.log('Quill ist bereits initialisiert!');
        return; // Quill wird nicht noch einmal initialisiert
    }

    const quill = new Quill(selector, {
        theme: "snow",
        modules: {
            resize: {
                // set embed tags to capture resize
                embedTags: ["VIDEO", "IFRAME"],
                // custom toolbar
                tools: [
                    "left",
                    "center",
                    "right",
                    "full",
                    "edit",
                    {
                        text: "Alt",
                        verify(activeEle) {
                            return activeEle && activeEle.tagName === "IMG";
                        },
                        handler(evt, button, activeEle) {
                            let alt = activeEle.alt || "";
                            alt = window.prompt("Alt for image", alt);
                            if (alt == null) return;
                            activeEle.setAttribute("alt", alt);
                        },
                    },
                ],
            },
            toolbar: toolbarselector //toolbarOptions
        },
    });


    quill.getModule('toolbar').addHandler('image', () => {
        selectLocalImage(selector, true, maximagewidth, maximageheight);
    });


    el.__quill = quill;

    // nach der zuweisung zu el.__quill !!!!
    setupDragAndDrop(selector, true, maximagewidth, maximageheight);
}
function setupDragAndDrop(selector, useBase64, maximagewidth, maximageheight) {
    const el = document.querySelector(selector);
    if (el && el.__quill) {
        const editorRoot = el.__quill.root;


        async function handleFile(file) {
            if (file && file.type.startsWith('image/')) {
                const resizedBlob = await resizeImage(file, maximagewidth, maximageheight);

                if (useBase64) {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        const base64data = reader.result;
                        insertToEditor(selector, base64data);
                    };
                    reader.readAsDataURL(resizedBlob);
                } else {
                    const formData = new FormData();
                    formData.append('file', resizedBlob, file.name);

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    insertToEditor(selector, data.url);
                }
            }
        }

        editorRoot.addEventListener('drop', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const file = e.dataTransfer.files[0];
            if (file) {
                await handleFile(file);
            }
        }, true);

        editorRoot.addEventListener('paste', async function (e) {
            const clipboard = e.clipboardData || window.clipboardData;
            if (!clipboard) return;

            const items = clipboard.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        await handleFile(file);
                    }
                }
            }
        }, true);
    }
}
async function selectLocalImage(selector, useBase64, maximagewidth, maximageheight) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];

        // Automatisch skalieren
        const resizedBlob = await resizeImage(file, maximagewidth, maximageheight);

        if (useBase64) {
            const reader = new FileReader();
            reader.onloadend = function () {
                const base64data = reader.result;
                insertToEditor(selector, base64data);
            };
            reader.readAsDataURL(resizedBlob);
        } else {
            const formData = new FormData();
            formData.append('file', resizedBlob, file.name);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            insertToEditor(selector, data.url);
        }
    };
}

function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            let ratio = 1;

            if (maxWidth || maxHeight) {
                const widthRatio = maxWidth ? (maxWidth / width) : 1;
                const heightRatio = maxHeight ? (maxHeight / height) : 1;
                ratio = Math.min(widthRatio, heightRatio, 1);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width * ratio;
            canvas.height = height * ratio;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                resolve(blob);
            }, file.type || 'image/jpeg', 0.9);
        };
        img.src = URL.createObjectURL(file);
    });
}
function insertToEditor(selector, url) {
    const el = document.querySelector(selector);
    if (el && el.__quill) {
        const range = el.__quill.getSelection(true);
        if (range) {
            el.__quill.insertEmbed(range.index, 'image', url);
            el.__quill.setSelection(range.index + 1);
        } else {
            console.warn('No selection in editor, inserting at the end.');
            el.__quill.insertEmbed(el.__quill.getLength(), 'image', url);
        }
    }
}

export function getQuillText(selector) {
    const el = document.querySelector(selector);
    if (el && el.__quill) {
        var text = el.__quill.getText();
        return text;
    }
    return "";
}

export function getQuillHtml(selector) {
    const el = document.querySelector(selector);
    if (el && el.__quill) {
        return el.__quill.root.innerHTML;
    }
    return "";
}

export function setHtmlContent(selector, htmlContent) {
    const el = document.querySelector(selector);
    if (el && el.__quill) {
        el.__quill.root.innerHTML = htmlContent;
    }
}