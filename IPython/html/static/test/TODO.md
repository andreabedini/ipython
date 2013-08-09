TODO list
=========

- maybe reimplement callbacks for execution requests

- Storage
	- load/save/autosave to local storage
		- [DONE] LocalStorage service
		- sessionStorage any useful?

	- load/save to gist?
	- load/save to dropbox?

		https://github.com/dropbox/dropbox-js/blob/stable/guides/getting_started.md
		// Browser-side applications do not use the API secret.
		var client = new Dropbox.Client({ key: "your-key-here" });
		});

		http://stackoverflow.com/questions/14659104/uploading-files-to-dropbox-using-javascript-for-a-single-page-app

		- core api?
		- datastore api?
			https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore.DatastoreManager

- Fix MathJax

- Frontend needs to know whether to enclose html into an iframe or not
	ad es. not if the kernel is supplying an iframe already

- this is cool: a way to pass kernel messages all the way to inside the iframe
	- doable with postMessage

	http://dev.opera.com/articles/view/window-postmessage-messagechannel/
	http://html5demos.com/postmessage2
	http://codetheory.in/using-html5-postmessage-for-a-secured-cross-domain-communication-and-rendering/

	- also, iframe resizing

	http://davidwalsh.name/window-iframe
	http://stackoverflow.com/questions/7532315/cross-domain-iframe-resizer-using-postmessage

- embedded video and audio

- store embedded image data as Blobs, rather than using data uris

	https://developer.mozilla.org/en-US/docs/Web/API/Blob

	more memory efficient. ALSO, if I could get the kernel to not base64 encode the binary
	it would save a lot of bandwidth.

- [silly] drag&drop to reorder cells?

- file upload/download

	http://www.html5rocks.com/en/features/file_access

- [DONE] fix codemirror focus. I might need to hack into ui-codemirror.js
- fix blinking when output gets replaced

- [DONE] completion
- keybindings
- help system

NOTES
=====

- http://www.paulirish.com/2010/the-protocol-relative-url/
