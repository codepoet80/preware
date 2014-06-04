/*global enyo, preware */
/*jslint sloppy: true */

enyo.kind({
    name: "preware.PackageDisplay",
    kind: "FittableRows",

    published: {
        currentPackage: {}
    },

    components: [
        {
            kind: "Signals",
            onPackageRefresh: "handlePackageRefresh",
            onBackendSimpleMessage: "processSimpleMessage",
            onPackageProgressMessage: "processProgressMessage"
        },
        {
            kind: "onyx.Toolbar",
            components: [
                {name: "PackageIcon", kind: "Image", style: "height: 100%; margin-right: 8px;"},
                {name: "PackageTitle", style: "display: inline-block; position: absolute;", content: "Package"}
            ]
        },
        {
            kind: "Scroller",
            style: "position: absolute; top: 54px; bottom: 54px;",
            classes: "enyo-fill",
            horizontal: "hidden",
            touch: true,
            ontap: "showPackage",
            components: [
                {
                    style: "padding: 15px;",
                    classes: "width: 80%; margin: 0 auto",
                    components: [
                        {
                            kind: "onyx.Groupbox",
                            components: [
                                {kind: "onyx.GroupboxHeader", content: "Description"},
                                {
                                    name: "PackageDescription",
                                    style: "padding: 15px; color: white;",
                                    allowHtml: true
                                },
                                {kind: "onyx.GroupboxHeader", content: "Homepage"},
                                {name: "PackageHomepage",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Maintainter"},
                                {name: "PackageMaintainer",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Version"},
                                {name: "PackageVersion",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Last Updated"},
                                {name: "PackageLastUpdated",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Download Size"},
                                {name: "PackageDownloadSize",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Installed Version"},
                                {name: "PackageInstalledVersion",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Installed"},
                                {name: "PackageInstalledDate",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Installed Size"},
                                {name: "PackageInstalledSize",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "ID"},
                                {name: "PackageID",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "License"},
                                {name: "PackageLicense",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Type"},
                                {name: "PackageType",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Category"},
                                {name: "PackageCategory",
                                    style: "padding: 15px; color: white;"},

                                {kind: "onyx.GroupboxHeader", content: "Feed"},
                                {name: "PackageFeed",
                                    style: "padding: 15px; color: white;"}
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: "SimpleMessage",
            kind: "Toast",
            style: "height: 90px;",
            components: [
                {
                    name: "SimpleMessageContent",
                    style: "display: block; font-size: 14pt; height: 32px;",
                    allowHtml: true,
                    content: "Message<br>I am a fish."
                },
                {kind: "onyx.Button", style: "display: block; width: 100%; margin-top: 4px;", content: "Okay", ontap: "hideSimpleMessage"}
            ]
        },
        {
            name: "ActionMessage",
            kind: "Toast",
            components: [
                {
                    name: "ActionMessageContent",
                    style: "display: block; font-size: 14pt; height: 46px;",
                    allowHtml: true,
                    content: "Message<br>I am a fish."
                },
                {kind: "onyx.Button", style: "display: block; width: 100%; margin-top: 10px;", content: "Button 1", ontap: "hideActionMessage"},
                {kind: "onyx.Button", style: "display: block; width: 100%; margin-top: 10px;",  content: "Button 2", ontap: "hideActionMessage"}
            ]
        },
        {
            name: "ProgressMessage",
            kind: "Toast",
            style: "height: 256px;",
            components: [
                {
                    name: "ProgressMessageContent",
                    style: "display: block; font-size: 14pt; height: 132px; margin-top: 8px;",
                    allowHtml: true,
                    content: "Message<br>I am a fish."
                },
                {kind: "onyx.Spinner", classes: "onyx-light"}
            ]
        },
        {
            kind: "GrabberToolbar",
            style: "position: absolute; bottom: 0; width: 100%;",
            components: [
                {name: "InstallButton", kind: "onyx.Button", content: "Install", ontap: "installTapped"},
                {name: "UpdateButton", kind: "onyx.Button", content: "Update", ontap: "updateTapped"},
                {name: "RemoveButton", kind: "onyx.Button", content: "Remove", ontap: "removeTapped"},
                {name: "LaunchButton", kind: "onyx.Button", content: "Launch", ontap: "launchTapped"}
            ]
        }
    ],


    //handlers:
    launchTapped: function () {
        this.currentPackage.launch();
    },
    installTapped: function () {
        this.currentPackage.doInstall();
    },
    updateTapped: function () {
        this.currentPackage.doUpdate();
    },
    removeTapped: function () {
        this.currentPackage.doRemove();
    },
    handlePackageRefresh: function () {
        if (this.currentPackage && this.currentPackage.title) {
            this.updateCurrentPackage(this.currentPackage.title);
            this.refreshPackageDisplay();
        }
    },


    //handlers for messages:
    processSimpleMessage: function (inSender, inEvent) {
        this.displaySimpleMessage(inEvent.message);
    },
    displaySimpleMessage: function (inMessage) {
        this.hideProgressMessage();
        this.hideActionMessage();

        this.$.SimpleMessageContent.setContent(inMessage);
        if (this.$.SimpleMessage.value !== this.$.SimpleMessage.min) {
            this.$.SimpleMessage.animateToMin();
        }
    },
    hideSimpleMessage: function () {
        this.$.SimpleMessage.animateToMax();
    },
    processProgressMessage: function (inSender, inEvent) {
        this.displayProgressMessage(inEvent);
    },
    displayProgressMessage: function (inEvent) {
        this.hideSimpleMessage();
        this.hideActionMessage();

        this.$.ProgressMessageContent.setContent(inEvent.message);
        if (this.$.ProgressMessage.value !== this.$.ProgressMessage.min) {
            this.$.ProgressMessage.animateToMin();
        }
    },
    hideProgressMessage: function () {
        this.$.ProgressMessage.animateToMax();
    },
    displayActionMessage: function (inEvent) {
        this.hideSimpleMessage();
        this.hideProgressMessage();

        this.$.ActionMessageContent.setContent(inEvent.message);
        if (this.$.ActionMessage.value !== this.$.ActionMessage.min) {
            this.$.ActionMessage.animateToMin();
        }
    },
    hideActionMessage: function () {
        this.$.ActionMessage.animateToMax();
    },
    currentPackageChanged: function () {
        this.refreshPackageDisplay();
    },

    //public functions:
    selectPackage: function (title) {
        this.updateCurrentPackage(title);
        this.refreshPackageDisplay();
    },

    //auxillary functions:
    updateCurrentPackage: function (inTitle) {
        var i, pkg;
        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];
            if (pkg.title === inTitle) {
                this.currentPackage = pkg;
                break;
            }
        }
    },
    refreshPackageDisplay: function () {
        this.$.PackageTitle.setContent(this.currentPackage.title);
        this.$.PackageIcon.setSrc(this.currentPackage.icon);
        this.$.PackageDescription.setContent(this.currentPackage.description);
        this.$.PackageHomepage.setContent(this.currentPackage.homepage);
        this.$.PackageMaintainer.setContent(this.currentPackage.maintainer);
        this.$.PackageVersion.setContent(this.currentPackage.version);
        this.$.PackageLastUpdated.setContent(this.currentPackage.date);
        this.$.PackageDownloadSize.setContent(this.currentPackage.size);
        this.$.PackageInstalledVersion.setContent(this.currentPackage.versionInstalled);
        this.$.PackageInstalledDate.setContent(this.currentPackage.dateInstalled);
        this.$.PackageInstalledSize.setContent(this.currentPackage.sizeInstalled);
        this.$.PackageID.setContent(this.currentPackage.pkg);
        this.$.PackageLicense.setContent(this.currentPackage.license);
        this.$.PackageType.setContent(this.currentPackage.type);
        this.$.PackageCategory.setContent(this.currentPackage.category);
        this.$.PackageFeed.setContent(this.currentPackage.feedString);

        this.$.InstallButton.setDisabled(this.currentPackage.isInstalled);
        this.$.UpdateButton.setDisabled(!this.currentPackage.isInstalled || !this.currentPackage.hasUpdate);
        this.$.RemoveButton.setDisabled(!this.currentPackage.isInstalled);
        this.$.LaunchButton.setDisabled(!this.currentPackage.isInstalled);
    }
});
