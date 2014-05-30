/*jslint sloppy: true, regexp: true */
/*global enyo, preware */
/*
 * filePicker
 *
 * usage:
 * var f = new filePicker({
 *
 *        type: 'file',                // or folder, it changes the interface and what it returns
 *                                         defaults to file
 *
 *        onSelect: function,            // function that will be called upon completion,
 *                                         it will be passed either a file/folder based on type or false for a cancel
 *                                         this is the only required parameter
 *
 *        root: false,                //    weather or not to allow access to root
 *
 *        folder: '/media/internal/',    // initial folder location, notice the trailing slash!
 *
 *        extensions: ['jpg','png'],    // (file type only) array of extensions to list (lowercase extensions only)
 *                                    // ['ext'] for single extension
 *                                    // [] for all extensions (DEFAULT)
 * });
 *
 *
 */
enyo.kind({
    name: "preware.FilePicker",
    kind: "FittableRows",
    published: {
        num: 0,
        type: 'file',
        root: false,
        topLevel: this.root ? '/' : '/media/internal/',
        folder: this.topLevel,
        extensions: []
    },
    currentContent: [],
    events: {
        onListingDone: "", //inEvent will have results: [array of files], success: true / false, directory: string (orignal directory)
        onSelect: ""       //inEvent will have value: selected value, success: true / false
    },
    statics: {
        num: 0,
        folderRegExp: new RegExp(/^\./),
        fileRegExp: new RegExp('^(.+)/([^/]+)$'),
        extensionRegExp: new RegExp(/\.([^\.]+)$/)
    },
    components: [
        {kind: "onyx.Toolbar", components: [
            {style: "display: inline-block; position: absolute;", content: "Files"}
        ]},
        {
            kind: "Scroller",
            horizontal: "hidden",
            classes: "enyo-fill",
            style: "background-image:url('assets/bg.png')",
            touch: true,
            fit: true,
            components: [
                {name: "ContentRepeater", kind: "Repeater", onSetupItem: "setupContentItem", count: 0, components: [
                    {kind: "ListItem", content: "File", icon: true, ontap: "contentTapped"}
                ]}
            ]
        }
    ],


    create: function () {
        this.inherited(arguments);

        this.folderChanged();
    },

    //handlers:
    folderChanged: function () {
        this.getDirectory(this.folder);
    },
    contentTapped: function (inSender, inEvent) {
        var index = inEvent.index,
            item  = this.currentContent[index] || {};
console.log("Tapped on: " + index + " = " + JSON.stringify(item));
        if (item.type === "directory") {
            this.setFolder(item.location);
        } else {
            this.doSelect({value: item.location, success: true});
        }
    },
    setupContentItem: function (inSender, inEvent) {
        var index = inEvent.index,
            item = inEvent.item;
        item.$.listItem.$.ItemTitle.setContent(this.currentContent[index].name);
        if (this.currentContent[index].type === "directory") {
            item.$.listItem.$.ItemIcon.setSrc("assets/folder.png");
        } else {
            item.$.listItem.$.ItemIcon.setSrc("assets/file.png");
        }
        return true;
    },

    //auxillary functions:
    getDirectory: function (dir) {
        preware.IPKGService.getDirListing(this.parseDirectory.bind(this, dir), dir);
    },
    parseDirectory: function (dir, payload) {
console.log("Got dir listing: " + dir + " = " + JSON.stringify(payload));
        var returnArray = [], c;
        if (payload.contents.length > 0) {
            for (c = 0; c < payload.contents.length; c += 1) {
                if (!payload.contents[c].name.match(preware.FilePicker.folderRegExp)
                         && ((this.validExtension(payload.contents[c].name) && payload.contents[c].type === 'file') || payload.contents[c].type !== 'file')) {
                    returnArray.push({
                        name: payload.contents[c].name,
                        type: payload.contents[c].type,
                        location: dir + payload.contents[c].name
                    });
                }
            } //end for
        } //end if payload.contents

        //sort array
        if (returnArray.length > 0) {
            returnArray.sort(function (a, b) {
                var strA, strB;
                if (a.name && b.name) {
                    strA = a.name.toLowerCase();
                    strB = b.name.toLowerCase();
                    return ((strA < strB) ? -1 : ((strA > strB) ? 1 : 0));
                }
                return -1;
            });
        }

        this.currentContent = returnArray;
        this.$.ContentRepeater.setCount(returnArray.length);

        this.doListingDone({results: returnArray, directory: dir, success: true});
    },
    getDirectories: function (dir) {
        preware.IPKGService.getDirListing(this.parseDirectories.bind(this, dir), dir);
    },
    parseDirectories: function (dir, payload) {
        var returnArray = [], c;
        if (payload.contents.length > 0) {
            for (c = 0; c < payload.contents.length; c += 1) {
                if (!payload.contents[c].name.match(preware.FilePicker.folderRegExp) && payload.contents[c].type === 'directory') {
                    returnArray.push({
                        name: payload.contents[c].name,
                        type: payload.contents[c].type,
                        location: dir + payload.contents[c].name
                    });
                }
            } //end for
        } //end if payload.contents

        //sort array
        if (returnArray.length > 0) {
            returnArray.sort(function (a, b) {
                var strA, strB;
                if (a.name && b.name) {
                    strA = a.name.toLowerCase();
                    strB = b.name.toLowerCase();
                    return ((strA < strB) ? -1 : ((strA > strB) ? 1 : 0));
                }
                return -1;
            });
        }

        this.currentContent = returnArray;
        this.$.ContentRepeater.setCount(returnArray.length);

        this.doListingDone({results: returnArray, directory: dir, success: true});
    },
    ok: function (value) {
        this.doSelect({value: value, success: true});
    },
    cancel: function () {
        this.doSelect({value: false, success: false});
    },
    validExtension: function (name) {
        var match;
        if (this.extensions.length > 0) {
            match = preware.FilePicker.extensionRegExp.exec(name);
            if (match && match.length > 1) {
                if (this.extensions.include(match[1].toLowerCase())) {
                    return true;
                }
            }
            //no extension did match or no extension at all => false
            return false;
        }
        //have no extensions filter, so everything is accepted.
        return true;
    },
    parseFileString: function (f) {
        return f.replace(/\/media\/internal\//i, 'USB/');
    },
    parseFileStringForId: function (p) {
        return p.toLowerCase().replace(/\//g, '-').replace(/ /g, '-').replace(/\./g, '-');
    },
    getFileName: function (p) {
        var match = preware.FilePicker.fileRegExp.exec(p);
        if (match && match.length > 1) {
            return match[2];
        }
        return p;
    }
});
