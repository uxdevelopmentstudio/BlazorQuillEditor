# Blazor Quill Editor
Blazor Quill Editor Class Library

![alt text](images/sample.gif)

## Blazor Quill Editor Features:
* Bilder per Drag & Drop, Paste oder Dateiauswahl einf�gen
* Automatisches Resizing von Bildern beim Einf�gen
* Base64- oder File-Upload-Modus w�hlbar

## SimpleBlog mit Blazor Quill Editor
Dies ist ein Beispielprojekt f�r einen einfachen Blog mit Blazor Server.
Es nutzt:

Quill Editor f�r die Texteingabe (mit Bild-Upload / Drag & Drop / Paste Support)

API-Backend zum Speichern und Laden von Blogposts


### Base64 oder File Upload
Per default ist in der ***quill.initialize.js*** die Option Base64 auf true eingestellt, so das die
Bilder als Base64 eingebettet werden.
Wenn ihr einen File-Upload m�chtet, solltet ihr den Pfad entsprechend eurer Struktur einstellen. 
Der Default Pfad zeigt auf : ***/api/upload***.
Ggf. sollte auch eine Authentifizierung implementieren werden.

## Usage
Kopiert die Klassenbibliothek in eurer Projekt und f�gt den QuillEditor zu eurer Projektmappe und eurem Projekt hinzu.

Wenn ihr die Base64 Einstellung beibehaltet, solltet ihr die MaximumReceiveMessageSize entspechend erh�hen:

Programm.cs
```
builder.Services.AddServerSideBlazor()
    // Die default Receive Size ist 32KB. Das f�hrt zu Problemen beim speichern der
    // Eintr�ge wenn Bilder als Base64 enthalten sind!
    .AddHubOptions(options =>
    {
        options.MaximumReceiveMessageSize = 10 * 1024 * 1024; // 10 MB 
    });
```

Imports
```
@using QuillEditor
```

YourAdminPage.razor
```
<QuillEditorBox @ref="editor" MaxImageWidth="400" MaxImageHeight="400" />
```
MaxImageWidth und MaxImageHeight sind Optional. 
Hiermit wird direkt beim Einf�gen die Bildgr��e auf die jeweilige Maximalangabe skaliert, 
so dass die Images tats�chlich auch in der Dateigr��e sich verkleinern. 

## Hinweis
Damit die Classes die Quill im HTML zur�ckgibt auch auf eurer Ausgabeseite �bernommen werden, 
muss sich der HTML Content in folgender Struktur befinden:

_Host.cshtml
```
<link href="./_content/uxBlazorQuillEditor/css/quilleditor.css" rel="stylesheet" />
```

YourBlogPage.razor
```
<div class="ql-snow">
    <!-- Um den Stylesheet von quill zu �bernehmen!! -->
    <div class="ql-editor">
        <!-- Um den Stylesheet von quill zu �bernehmen!! -->
                
        @((MarkupString)post.HtmlContent)
    </div>
</div>
```

---
### Verwendete Quellen und f�r offline Benutzung integriert:
Quill Resize Module v2.0.3
```
File: quill.resize.js
File: quill.resize.css
```

 * https://github.com/mudoo/quill-resize-module
 * The MIT License
 * Copyright � 2018


Quill Module v2.0.3
```
File: quill.js
File: quill.snow.css
```

 * https://quilljs.com/
 * https://github.com/slab/quill
 * Copyright (c) 2017-2024, Slab
 * Copyright (c) 2014, Jason Chen
 * Copyright (c) 2013, salesforce.com
 * All rights reserved.