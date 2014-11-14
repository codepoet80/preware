/*jslint sloppy: true */
/*global enyo, preware, $L, console, setTimeout */
//shows a dialog that allows the user to select an IPK for install.

enyo.kind({
    name: "InstallPackageDialog",
    classes: "enyo-popup",
    style: "padding: 15px; width: 90%; height: 90%;",
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
                    style: "padding: 15px;",
                    components: [
                        {tag: "div", classes: "webosstyle-groupbox", components: [
                        	{tag: "div", classes: "webosstyle-groupbox-header", content: $L("Package Location")},
                			{tag: "div", classes: "webosstyle-groupbox-body-single", style: "width: 100%", components:[
								{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
									{kind: "onyx.InputDecorator", style: "width: 100%;", components: [
										{name: "ipkEdit", kind: "onyx.Input", classes: "enyo-fill", style: "text-align: left;color: white;", oninput: "validatePackageLocation", onfocus: "checkFocus", onblur: "checkBlur", placeholder: $L("http:// or file:// or ftp://")}
									]},
								]},                			
                			]},
                		]},
                		{ kind: "onyx.Button", content: $L("Browse"), style:"width: 100%;", classes: "onyx-dark", ontap: "browseFiles" },
                        {name: "getInfoButton", kind: "onyx.Button", content: $L("Get Info"), style:"width: 100%; margin-top: 5px;", classes: "onyx-dark", ontap: "getInfo", disabled: true },
                        {name: "installButton", kind: "onyx.Button", content: $L("Install"), style:"width: 100%; margin-top: 5px;", classes: "onyx-dark", ontap: "install", disabled: true },
                        {tag: "div", style:"margin-top: 10px; color: white; background-color: #444; border-color: #aaaaaa; border-style: solid; border-width: 1px 1px 1px 1px; padding: 10px; border-radius: 8px;", components:[
                        	{tag: "div", style:"font-weight: bold;", content:$L("Note:")},
                        	{tag: "div", content:$L("If this package needs a luna restart or device restart after installation, you will need to manually perform it when the installation is complete.")},
                        ]},
                        {tag: "div", fit: true},
                        {tag: "div", style:"width: 100%; text-align: center", components: [
        					{kind: "onyx.Button", classes: "onyx-affirmative", style: "margin:5px; width: 18%; min-width: 100px; font-size: 18px;", content: $L("Close"), ontap: "closePopup"}
        				]},
                    ]
                }, //end of selectPanel.
                {
                    name: "spinnerPanel",
                    kind: "enyo.FittableRows",
                    classes: "enyo-fill enyo-fit",
                    style: "border-radius: 8px;",
                    components: [
                        {tag: "div", classes: "center", style:"width: 40%; margin-top: 20%; min-width: 300px; color: white; background-color: #383838; border-color: #aaaaaa; border-style: solid; border-width: 1px; padding: 10px; border-radius: 8px;", components:[
							{ kind: "onyx.Spinner", style: "display: block; margin: 10% auto;" },
							{
								kind: "enyo.Scroller",
								classes: "enyo-fill center",
								components: [
									{ name: "message", classes: "enyo-fill center", style: "display: block; font-size: 14pt; margin-top: 8px; margin-bottom: 10px; width: 80%; max-width: 500px; max-height: 200px;",
											allowHtml: true, content: "Placeholder." }
								]
							},
                        ]},
                        {tag: "div", style:"width: 100%; text-align: center", components: [
        					{name: "spinnerBackBtn", kind: "onyx.Button", classes: "onyx-dark", style: "margin:5px; width: 18%; min-width: 100px; font-size: 18px;", showing: "false", content: $L("Back"), ontap: "backFromSpinner"}
        				]}
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
            this.closePopup();
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
			this.$.ipkEdit.setValue("");
			this.$.getInfoButton.setDisabled(true);
			this.$.installButton.setDisabled(true);
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
        this.$.message.setContent("Getting info for " + this.filename);
        this.originalMessage = "Getting info for " + this.filename;
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
                this.validatePackageLocation();
            }
            this.$.Panels.setIndex(this.selectPanelIndex);
        }
    },
	validatePackageLocation: function (inSender, inEvent) {
		if (this.$.ipkEdit.getValue() != "")
		{
			this.$.getInfoButton.setDisabled(false);
			this.$.installButton.setDisabled(false);
		}
		else
		{
			this.$.getInfoButton.setDisabled(true);
			this.$.installButton.setDisabled(true);
		}
	},
	
    //results:
    gotInfo: function (payload) {
        console.log("control extracted: " + JSON.stringify(payload));
        if (payload.stage) {
            if (payload.stage === "completed") {
                var infoObj = this.parsePackage(payload.info);
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
    },
    
    //processing
    parsePackage: function (rawData, url) {
        var test, lineRegExp, curPkg, x, match;
        try {
            if (rawData) {
              	test = rawData;
                lineRegExp = new RegExp(/[\s]*([^:]*):[\s]*(.*)[\s]*$/);
                curPkg = false;

                for (x = 0; x < test.length; x += 1) {
                    match = lineRegExp.exec(test[x]);
                    if (match) {
                        if (match[1] === 'Package' && !curPkg) {
                            curPkg = {
                                Size: 0,
                                Status: '',
                                Architecture: '',
                                Section: '',
                                Package: '',
                                Filename: '',
                                Depends: '',
                                Maintainer: '',
                                Version: '',
                                Description: '',
                                MD5Sum: '',
                                'Installed-Time': 0,
                                'Installed-Size': 0,
                                Source: ''
                            };
                        }
                        if (match[1] && match[2]) {
                            curPkg[match[1]] = match[2];
                        }
                    } else {
						throw $L("Failed to Parse Package");
                    }
                }
            }
        } catch (e) {
            console.error('error in packagesModel#parsePackages: ' + e);
            this.$.message.setContent("Error: " + e.errorText);
            this.ipkOperation = false;
            setTimeout(function () { this.$.Panels.setIndex(this.selectPanelIndex);  }.bind(this), 2000);
        }

        return curPkg;
    },
    
    //utility
    checkFocus: function(source, event) {
		source.applyStyle("color", "black");
	},

	checkBlur: function(source, event) {
		source.applyStyle("color", "white");
	}
});
