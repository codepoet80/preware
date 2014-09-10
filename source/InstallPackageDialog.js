/*jslint sloppy: true */
/*global enyo, preware, $L, console, setTimeout */
//shows a dialog that allows the user to select an IPK for install.

enyo.kind({
    name: "InstallPackageDialog",
    classes: "enyo-popup enyo-fill",
    style: "padding: 0",
    kind: "onyx.Popup",
    centered: true,
    modal: true,
    floating: true,
    autoDismiss: false,
    scrim: true,
    scrimWhenModal: false,
    ipkOperation: false,
    components: [
        {
            kind: "enyo.Panels",
            name: "Panels",
            realtimeFit: true,
            classes: "enyo-fit enyo-fill",
            draggable: false,
            arrangerKind: "CardArranger",
            components: [
                {  //panel to select the IPK.
                    name: "selectPanel",
                    kind: "FittableRows",
                    classes: "enyo-fill enyo-fit",
                    style: "background-image:url('assets/bg.png'); border-radius: 8px;",
                    components: [
                        {kind: "onyx.Toolbar", components: [
                            {classes: "top-title", content: "Fileselection"}
                        ]},
                        {
                            kind: "onyx.Groupbox",
                            classes: "horizontal-groups",
                            components: [
                                {
                                    kind: "onyx.InputDecorator",
                                    components: [
                                        {kind: "onyx.Input", classes: "enyo-fill", style: "text-align: left;", placeholder: $L("http:// or file:// or ftp://"), name: "ipkEdit"}
                                    ]
                                }
                            ]
                        },
                        {
                            kind: "onyx.Groupbox",
                            classes: "horizontal-groups",
                            components: [
                                { kind: "onyx.Button", classes: "horizontal-buttons", content: $L("Browse"), ontap: "browseFiles" },
                                { kind: "onyx.Button", classes: "horizontal-buttons", content: $L("Get Info"), ontap: "getInfo" },
                                { kind: "onyx.Button", classes: "horizontal-buttons", content: $L("Install"), ontap: "install" }
                            ]
                        },
                        {
                            kind: "onyx.Toolbar",
                            classes: "bottom-toolbar",
                            components: [
                                { kind: "onyx.Button", content: $L("Close"), ontap: "closePopup"}
                            ]
                        }
                    ]
                }, //end of selectPanel.
                {
                    name: "spinnerPanel",
                    kind: "enyo.FittableRows",
                    classes: "enyo-fill enyo-fit",
                    style: "background-image:url('assets/bg.png'); border-radius: 8px;border-radius: 8px;",
                    components: [
                        { kind: "onyx.Spinner", style: "display: block; margin: 10% auto;" },
                        {
                            kind: "enyo.Scroller",
                            classes: "enyo-fill center",
                            components: [
                                { name: "message", classes: "enyo-fill center", style: "display: block; font-size: 14pt; margin-top: 8px; width: 80%; max-width: 500px;",
                                        allowHtml: true, content: "Placeholder." }
                            ]
                        },
                        {
                            kind: "onyx.Toolbar",
                            classes: "bottom-toolbar",
                            components: [
                                { kind: "onyx.Button", name: "spinnerBackBtn", showing: "false", content: $L("Back"), ontap: "backFromSpinner"}
                            ]
                        }
                    ]
                }, //end pf spinnerPanel
                { //infoPanel shows package info
                    name: "infoPanel",
                    kind: "FittableRows",
                    style: "background-image:url('assets/bg.png'); border-radius: 8px;",
                    components: [
                        {
                            kind: "enyo.Scroller",
                            classes: "enyo-fill enyo-fit",
                            components: [
                                {kind: "preware.PackageDisplay", name: "packageDisplay"}
                            ]
                        },
                        {
                            kind: "onyx.Toolbar",
                            comonents: [
                                { kind: "onyx.Button", content: $L("Close"), ontap: "closePopup"}
                            ]
                        }
                    ]
                },
                {
                    name: "filePickerPanel",
                    //style: "border-radius: 8px; height: 85% !important; width: 100%;",
                    classes: "enyo-fill",
                    components: [
                        {
                            kind: "preware.FilePicker",
                            name: "filePicker",
                            showing: false,
                            //fp options
                            type: "file",
                            root: preware.PrefCookie.get().browseFromRoot,
                            folder: "/media/internal",
                            extensions: ["ipk"],
                            onSelect: "handleSelect",
                            pop: false
                        }
                    ]
                }
            ]
        }, //end of panels

        //non ui stuff:
        {
            kind: "Signals",
            onbackbutton: "handleBackGesture",
            onBackendSimpleMessage: "installDone",
            onPackageProgressMessage: "statusMessage"
        }
    ],

    //global variables:
    uri: "", //absolute location of ipk file
    filename: "", //filename of package without path.

    //panel indices:
    selectPanelIndex: 0,
    spinnerPanelIndex: 1,
    infoPanelIndex: 2,
    filePickerPanelIndex: 3,

    create: function (inSender, inEvent) {
        this.inherited(arguments);
    },
    //handlers
    handleBackGesture: function (inSender, inEvent) {
        if (!this.getShowing() || this.$.filePickerPanel.getShowing()) {
            return; //don't process back gesture if not visible.
        }

        var index = this.$.Panels.getIndex();
        if (index === this.infoPanelIndex) {
            this.$.Panels.setIndex(this.selectPanelIndex);
        }
        if (!this.ipkOperation && index === this.spinnerPanelIndex) {
            this.$.Panels.setIndex(this.selectPanelIndex);
        }

        if (!this.ipkOperation && index === this.selectPanelIndex) {
            this.hide();
        }

        inEvent.preventDefault();
    },
    backFromSpinner: function (inSender, inEvent) {
        if (!this.ipkOperation) {
            this.$.Panels.setIndex(this.selectPanelIndex);
        }
    },
    closePopup: function (inSender, inEvent) {
        if (!this.ipkOperation) {
            this.hide();
        }
    },
    browseFiles: function (inSender, inEvent) {
        this.$.Panels.setIndex(this.filePickerPanelIndex);
        this.$.filePicker.show();
        this.$.filePicker.folderChanged(); //reload directory.
    },
    getInfo: function (inSender, inEvent) {
        this.uri = this.$.ipkEdit.getValue();
        this.filename = this.$.filePicker.getFileName(this.uri); //this extracts a filename from the uri, i.e. the last part.
                                                                 //ipk gets downloaded to /media/internal/.developer/$filename
        preware.IPKGService.extractControl(this.gotInfo.bind(this), this.filename, this.uri);
        this.$.Panels.setIndex(this.spinnerPanelIndex);
        this.$.message.setContent("Getting infor for " + this.filename);
        this.originalMessage = "Getting infor for " + this.filename;
        this.ipkOperation = true;
        this.$.spinnerBackBtn.hide();
    },
    install: function (inSender, inEvent) {
        this.uri = this.$.ipkEdit.getValue();
        this.filename = this.$.filePicker.getFileName(this.uri);
        var packageId = this.filename.split("_", 1)[0],
            packageModel = new preware.PackageModel("", {type: 'Package', pkg: packageId, title: packageId, filename: this.filename, location: this.uri});
        console.log("PackageId: " + packageId);

        this.$.Panels.setIndex(this.spinnerPanelIndex);
        this.$.message.setContent("Installing " + packageId);
        this.originalMessage = "Installing " + packageId;
        packageModel.doInstall();
        this.ipkOperation = true;
        this.$.spinnerBackBtn.hide();
    },
    handleSelect: function (inSender, inEvent) {
        if (!this.ipkOperation) {
            this.$.filePicker.hide();
            if (inEvent.success) {
                this.$.ipkEdit.setValue("file://" + inEvent.location);
            }
            this.$.Panels.setIndex(this.selectPanelIndex);
        }
    },

    //results:
    gotInfo: function (payload) {
        console.log("control extracted: " + JSON.stringify(payload));
        if (payload.stage) {
            if (payload.stage === "completed") {

                var infoObj = preware.PackagesModel.parsePackage(payload.info),
                    pkgModel;
                infoObj.type = "Package";
                infoObj.filename = this.filename;
                infoObj.location = this.uri;
                pkgModel = new preware.PackageModel(infoObj);
                this.ipkOperation = false;
                if (pkgModel) {
                    this.$.packageDisplay.setCurrentPackage(pkgModel);
                    //this.$.packageDisplay.refreshPackageDisplay();

                    this.$.Panels.setIndex(this.infoPanelIndex);
                    return;
                }
            } else if (payload.stage === "status") {
                this.$.message.setContent(this.originalMessage + "<br />" + payload.status);
            } else if (payload.stage === "failed") {
                this.$.message.setContent("Error: " + payload.errorText);
                this.ipkOperation = false;
                setTimeout(function () { this.$.Panels.setIndex(this.selectPanelIndex);  }.bind(this), 2000);
            }
        }
    },
    installDone: function (inSender, inEvent) {
        this.$.message.setContent(this.originalMessage + "<br /><bold>Done:</bold> " + inEvent.message);
        this.ipkOperation = false;
        this.$.spinnerBackBtn.show();
    },
    statusMessage: function (inSender, inEvent) {
        this.$.message.setContent(this.originalMessage + "<br />" + inEvent.message);
    }
});
