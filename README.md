Hi!
===

In this folder a proof of concept implementation of a notebook webapp using AngularJS.

I hacked this together in few days just because I love IPython and I wanted to learn some webdev, it is not supposed to be complete or even useful to anyone. I don't know much of IPython's internals so I just put everything inside the html notebook static folder. I know that this is not the way to start any serious business but, indeed, it is not.

To make sure the message is clear: I am a complete noob when it come to webdev, this is the first time I write javascript.

How to use this
---------------

Go to the main folder and start the notebook webapp as usual.

	$ python -m IPython notebook --no-browser

It will say something like

	The IPython Notebook is running at: http://127.0.0.1:8888/

Then go to the address `http://127.0.0.1:8888/static/test/index.html`

What you will find is a single-page app looking similar to the original notebook. The menu is there only to look like the original notebook but only few entries do anything (New, Move Cell Up/Down, Select Previous/Next Cell, Insert Cell Above/Below, Kernel Restart). Likewise for the toolbar, have a look to `partials/menu.html` and `partials/toolbar.html` to see what is implemented.

Type some input and press Shift-Enter to see it evaluated.

Notes
-----

- AngularJS is a MVC framework. That means the controller (`controllers/notebook.js`) knows nothing about the view, has no access to the DOM and only operates on the memory representation of the notebook.

- The rendering is performed by the template system (`partials/notebook.html`) with some auxiliary directives (`directives/`) that provide a 'smart' rendering (for example, the cell input is rendered as a codemirror instance, and the `outputCell` directive automatically picks the best content-type (when it works, of course)).

- AngularJS is wonderful because it provides a two-way data binding, that meaning when the notebook in the controller changes, the vies is automatically updated and vice versa(!): Type something in the input cell and the notebook memory representation automatically reflects the changes. There is no need to (de-)serialize the notebook, the notebook is a json document that can be passed around freely, stop.

- Notebooks persistency. I implemented a super basic persistency system using html5 localStorage. Clicking save on the toolbar (yes, that button works) will save the current notebook on the localStorage. Navingating to the same url (which contains an unique notebook identifier) will reload the same notebook and possibly reconnect to the same kernel session if it hasn't died in the meantime.

- The communication with the kernel (`services/kernel.js`) is a bit awkward. The cell will send an execution request using `Kernel.execute`, which returns a message id. The kernel will simply broadcast every received message to the `$rootScope`, and each cell will filter out the messages basing on the message id. This is a never ending process since it not clear to me when kernel replies are supposed to stop. In short this works but has to be rewritten.

- On the other hand, the completer service (`services/complete.js`) shows how to do things properly. Since a `complete_request` will be answered by a single `complete_reply`, `Completion.complete` can return a promise which will be resolved when the answer arrives.

- All html output from the kernel is sandboxed inside iframes. This avoids having to load tons of potentially insecure javascript on the main window. MathJax for example can be loaded only inside the frames which need it, same for any other visualization library (like d3). I tried to implement this for LaTeX content but it doesn't work yet. Also html5 postMessage can be used to safely exchange information between the inner and the outer frame, allowing a great degree of interactivity.

- I am not sure about this but rather than using data uris to embed the data sent by the kernel, it might be more appropriate to use Blobs: the kernel receive the data and stores it into a Blob, than generates a URI for it and passes it over. This would make serializing the notebook a tiny more elaborate. The only case it would be worth doing this is the kernel sends binary data.

- Finally, this is more a proof of concept than a real implementation. I won't be maintaining this. Rather, I will see if I can remplement any of the above on top of the existing notebook javascript code rather than replacing it.
