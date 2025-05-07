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

export function initializeQuill(selector, toolbarselector, maximagewidth, maximageheight, dotNetHelper) {
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
            table: true,
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
    function isInTable() {
        const selection = quill.getSelection();
        if (!selection) return false;
        const [line] = quill.getLine(selection.index);
        return line && line.domNode.closest('td, th');
    }

    quill.root.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && isInTable()) {
            if (e.shiftKey) {
                document.execCommand('insertText', false, '\n');
                e.preventDefault();
            }
        }
    }, true);


    const table = quill.getModule('table');

    document.querySelectorAll('.ql-column-left').forEach(button => {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-column-insert-left" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>  <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1z" />  <line x1="5" y1="12" x2="9" y2="12" />  <line x1="7" y1="10" x2="7" y2="14" /></svg>'
        button.title = "Add column left";
        button.addEventListener('click', () => {
            table.insertColumnLeft();
        });
    });
    document.querySelectorAll('.ql-column-right').forEach(button => {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-column-insert-right" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1z" /><line x1="15" y1="12" x2="19" y2="12" /><line x1="17" y1="10" x2="17" y2="14" /></svg>';
        button.title = "Add column right";
        button.addEventListener('click', () => {
            table.insertColumnRight();
        });
    });
    document.querySelectorAll('.ql-row-above').forEach(button => {
        button.innerHTML = '<svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m22 14a2 2 0 0 0 -2-2h-16a2 2 0 0 0 -2 2v7h2v-2h4v2h2v-2h4v2h2v-2h4v2h2zm-18 0h4v3h-4zm6 0h4v3h-4zm10 0v3h-4v-3zm-9-4h2v-3h3v-2h-3v-3h-2v3h-3v2h3z"/></svg>';
        button.title = "Add row above";
        button.addEventListener('click', () => {
            table.insertRowAbove();
        });
    });
    document.querySelectorAll('.ql-row-below').forEach(button => {
        button.innerHTML = '<svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m22 10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2-2v-7h2v2h4v-2h2v2h4v-2h2v2h4v-2h2zm-18 0h4v-3h-4zm6 0h4v-3h-4zm10 0v-3h-4v3zm-9 4h2v3h3v2h-3v3h-2v-3h-3v-2h3z"/></svg>'
        button.title = "Add row below";
        button.addEventListener('click', () => {
            table.insertRowBelow();
        });
    });
    document.querySelectorAll('.ql-row-remove').forEach(button => {
        button.innerHTML = '<svg height="16" viewBox="0 0 32 32" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m24 30h-20a2.0021 2.0021 0 0 1 -2-2v-6a2.0021 2.0021 0 0 1 2-2h20a2.0021 2.0021 0 0 1 2 2v6a2.0021 2.0021 0 0 1 -2 2zm-20-8h-.0015l.0015 6h20v-6z"/><path d="m30 3.41-1.41-1.41-3.59 3.59-3.59-3.59-1.41 1.41 3.59 3.59-3.59 3.59 1.41 1.41 3.59-3.59 3.59 3.59 1.41-1.41-3.59-3.59z"/><path d="m4 14v-6h14v-2h-14a2.0023 2.0023 0 0 0 -2 2v6a2.0023 2.0023 0 0 0 2 2h22v-2z"/><path d="m0 0h32v32h-32z" fill="none"/></svg>';
        button.title = "Remove row";
        button.addEventListener('click', () => {
            table.deleteRow();
        });
    });
    document.querySelectorAll('.ql-column-remove').forEach(button => {
        button.innerHTML = '<svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><g fill="#000"><path d="m6 4v16h2.67363c.35561.7486.84016 1.424 1.42497 1.9976-.0327.0016-.0655.0024-.0986.0024h-4c-1.10457 0-2-.8954-2-2v-16c0-1.10457.89543-2 2-2h4c1.1046 0 2 .89543 2 2v6.6736c-.7496.3561-1.4259.8415-2 1.4274v-8.101z"/><path d="m10 17c0-1.6358.7856-3.0882 2-4.0004.8357-.6277 1.8744-.9996 3-.9996 2.7614 0 5 2.2386 5 5s-2.2386 5-5 5c-1.2123 0-2.3239-.4315-3.1895-1.1492-1.106-.9171-1.8105-2.3017-1.8105-3.8508zm2 1h6v-2h-6z"/></g></svg>';
        button.title = "Remove column";
        button.addEventListener('click', () => {
            table.deleteColumn();
        });
    });

    quill.getModule('toolbar').addHandler('image', () => {
        selectLocalImage(selector, true, maximagewidth, maximageheight);
    });

    quill.on('text-change', function () {
        dotNetHelper.invokeMethodAsync('HandleContentChanged');
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