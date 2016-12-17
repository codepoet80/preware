Preware 2
=======
Preware 2 is the LuneOS on-device homebrew installer.

The webos-ports feed is enabled by default, and other feeds
can be enabled or added by selecting `Manage Feeds` from
the app menu.  Downloaded packages can be installed by
selection `Install Package` from the app menu.

Building/Installation
-------
At present, this only runs under LuneOS 
(no mocking is set up to develop in the browser).

To rebuild and install on a LuneOS device attached via USB, run this command in the app directory:
`./build-and-deploy.sh`
Then, in Chrome, surf to `localhost:1122` to debug.


To-do [out of date]
-----

First step is to convert needed stuff from preware/app/model to enyo. The status is as follows:

Working:
- prefs cookie should be working (tested in browser)
- basic IPKGService communictation (version, device id, tested on TouchPad)

Implemented (but untested):
- more complex IPKGService communication
- deviceProfile.js
- feeds.js
- palmProfile.js
- help.js

only Partly-Implemented:
- db8storage (used for just type)
- packageModel.js (renamed from package.js)
- filePicker.js (does some Mojo stuff to display stuff.. need to replace that)

not implemented at all:
- packages.js
- resourceHandler.js
- stayAwake.js

UI TO-DOs
- if a Repeater has no items, display a message in the blank space
