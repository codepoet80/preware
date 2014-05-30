/*jslint sloppy: true */
/*global enyo, preware, $L, console */
//shows a dialog that allows the user to select an IPK for install.

enyo.kind({
    name: "InstallPackageDialog",
    classes: "enyo-popup",
    //TODO: someone with more design skills than me should optimize that... :(
    style: "padding: 30px; width: 90%; height: 90%;",
    kind: "onyx.Popup",
    centered: true,
    modal: true,
    floating: true,
    autoDismiss: false,
    scrim: true,
    scrimWhenModal: false,
    components: [
        {
            kind: "enyo.Scroller",
            realtimeFit: true,
            classes: "enyo-fill",
            components: [
                {
                    kind: "enyo.Panels",
                    name: "Panels",
                    realtimeFit: true,
                    classes: "enyo-fit",
                    draggable: false,
                    arrangerKind: "CardArranger",
                    components: [
                        {  //panel to select the IPK.
                            name: "selectPanel",
                            components: [
                                {
                                    kind: "onyx.Groupbox",
                                    components: [
                                        {kind: "onyx.GroupboxHeader", content: $L("File selection")},
                                        {
                                            kind: "onyx.InputDecorator",
                                            components: [
                                                {kind: "onyx.Input", placeHolder: $L("http:// or file:// or ftp://"), name: "ipkEdit", style: "width: 200px;"}
                                            ]
                                        }
                                    ]
                                },
                                { kind: "onyx.Button", style: "margin:5px;font-size:24px;", content: $L("Browse"), ontap: "browseFiles" },
                                { kind: "onyx.Button", style: "margin:5px;font-size:24px;", content: $L("Get Info"), ontap: "getInfo" },
                                { kind: "onyx.Button", style: "margin:5px;font-size:24px;", content: $L("Install"), ontap: "install" }
                            ]
                        }, //end of selectPanel.
                        {
                            name: "spinnerPanel",
                            components: [
                                { kind: "onyx.Spinner"},
                                { name: "message", style: "display: block; font-size: 14pt; height: 132px; margin-top: 8px;",
                                    allowHtml: true, content: "Placeholder." }
                            ]
                        }, //end pf spinnerPanel
                        { //infoPanel shows package info
                            name: "infoPanel",
                            components: [
                                {kind: "preware.PackageDisplay", name: "packageDisplay"}
                            ]
                        },
                        {
                            name: "filePickerPanel",
                            components: [
                                {
                                    kind: "preware.FilePicker",
                                    name: "filePicker",
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
                }
            ]
        },
        { kind: "onyx.Button", style: "margin:5px;font-size:24px;", content: $L("Close"), ontap: "closePopup"},

        //non ui stuff:
        {
            kind: "Signals",
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
    filePickerPanel: 3,

    create: function (inSender, inEvent) {
        this.inherited(arguments);
    },
    //handlers
    closePopup: function (inSender, inEvent) {
        this.hide();
    },
    browseFiles: function (inSender, inEvent) {
        this.$.Panels.setIndex("filePickerPanel");
    },
    getInfo: function (inSender, inEvent) {
        this.uri = this.$.ipkEdit.getValue();
        this.filename = this.$.filePicker.getFileName(this.uri); //this extracts a filename from the uri, i.e. the last part.
                                                                 //ipk gets downloaded to /media/internal/.developer/$filename
        preware.IPKGService.extractControl(this.gotInfo.bind(this), this.filename, this.uri);
        this.$.Panels.setIndex(this.spinnerPanelIndex);
        this.$.message.setContent("Getting infor for " + this.filename);
        this.originalMessage = "Getting infor for " + this.filename;
    },
    install: function (inSender, inEvent) {
        this.uri = this.$.ipkEdit.getValue();
        this.filename = this.$.filePicker.getFileName(this.uri);
        var packageId = this.filename.split("_", 1)[0],
            packageModel = new preware.PackageModel({type: 'Package', pkg: packageId, title: packageId, filename: this.filename, location: this.uri});
        console.log("PackageId: " + packageId);

        this.$.Panels.setIndex(this.spinnerPanelIndex);
        this.$.message.setContent("Installing " + packageId);
        this.originalMessage = "Installing " + packageId;
        packageModel.doInstall();

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
                setTimeout(function () { this.$.Panels.setIndex(this.selectPanelIndex);  }.bind(this), 2000);
            }
        }
    },
    installDone: function (inSender, inEvent) {
        this.$.message.setContent(this.originalMessage + "<br /><bold>Done:</bold> " + inEvent.message);
        setTimeout(function () { this.$.Panels.setIndex(this.selectPanelIndex);  }.bind(this), 5000);
    },
    statusMessage: function (inSender, inEvent) {
        this.$.message.setContent(this.originalMessage + "<br />" + inEvent.message);
    }
});
