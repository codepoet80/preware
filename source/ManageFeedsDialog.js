/*jslint sloppy: true */
/*global enyo, onyx, preware, $L, console */
//shows a dialog that allows the user to change feed settings.

enyo.kind({
    name: "ManageFeedsDialog",
    classes: "enyo-popup",
    //TODO: someone with more design skills than me should optimize that... :(
    style: "padding: 15px; width: 90%; height: 90%;",
    kind: "onyx.Popup",
    //kind: "enyo.Control",
    centered: true,
    modal: true,
    floating: true,
    autoDismiss: false,
    scrim: true,
    scrimWhenModal: false,
    components: [
        {kind: "Signals", onLoadFeedsFinished: "onFeeds" },
        {name: "ManageFeedsScroller", touch: true, kind: "enyo.Scroller", style: "width: 100%;", components: [
            {tag: "div", classes: "webosstyle-groupbox", components: [
                {tag: "div", classes: "webosstyle-groupbox-header", content: $L("Installed")},
				{tag: "div", classes: "webosstyle-groupbox-body-repeater", style: "width: 100%", components:[
					{name: "repeater", kind: "enyo.DataRepeater", components: [
						{classes: "settings-item-repeater", components: [
							{kind: "enyo.FittableColumns", noStretch: true, components: [
								{kind: "enyo.FittableRows", fit: true, components: [
									{name: "feedName"},
									{name: "feedURL", style: "font-size: 10px; color: LightGray"},
								]},
								//TODO: find out where this value is stored
								{name: "feedCompressedToggle", kind: "onyx.ToggleButton", value: true}
							]}
						], bindings: [
							{from: ".model.name", to: ".$.feedName.content"},
							{from: ".model.url", to: ".$.feedURL.content"},
						]}
					]},
				]},
			]},
            {tag: "div", classes: "webosstyle-groupbox", components: [
                {tag: "div", classes: "webosstyle-groupbox-header", content: $L("New Feed")},
                {tag: "div", classes: "webosstyle-groupbox-body", style: "width: 100%", components:[
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{kind: "onyx.InputDecorator", style: "width: 100%;", components: [
							{name: "newFeedName", kind: "onyx.Input", style: "color: white", onfocus: "checkFocus", onblur: "checkBlur" },
							{name: "newFeedNameLabel", content: $L("Name"), style: "width: 65px; color: SkyBlue;"}
						]},
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{kind: "onyx.InputDecorator", style: "width: 100%;", components: [
							{name: "newFeedURL", kind: "onyx.Input", style: "width: 100%;  color: white", value: "http://", onfocus: "checkFocus", onblur: "checkBlur" },
							{name: "newFeedURLLabel", content: $L("URL"), style: "width: 65px; color: SkyBlue;"}
						]},
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-toggle", content: $L("Compressed"), fit: true},
						{kind: "onyx.ToggleButton", name: "newFeedCompressedToggle", onContent: $L("Yes"), offContent: $L("No") }
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", style:"text-align: center", components: [
						{name: "addNewFeedButton", kind: "onyx.Button", classes: "onyx-affirmative", content: $L("Add Feed"), ontap: "testNewFeed"}
					]}
                ]}
            ]},
        ]},
        {tag: "div", style:"width: 100%; text-align: center", components: [
        	{kind: "onyx.Button", classes: "onyx-affirmative", style: "margin:5px; width: 18%; min-width: 100px; font-size: 18px;", content: $L("Close"), ontap: "closePopup"}
        ]},
        {name: "alertDialog", kind: Preware.AlertDialog, onDismiss: "closeDialog"},
        {name: "warningDialog", kind: Preware.ChoiceDialog, onAction: "okWarning", onDismiss: "closeDialog"},
    ],

    bindings: [
		{from: ".collection", to: ".$.repeater.collection"}
	],

    create: enyo.inherit(function (sup) {
		return function () {
			this.collection = new enyo.Collection();
			this.warningOkd = false;
			sup.apply(this, arguments);
		};
	}),
	
	show: function() {
		//This is required to reset the shim so that it displays correctly when we are displaying a dialog on top of a dialog.
		this.$.alertDialog.show();
		this.$.alertDialog.hide();
		
		this.$.warningDialog.show();
		this.$.warningDialog.hide();
		
		this.inherited(arguments);
	},

    //handlers
    onFeeds: function (inSender, inEvent) {
        var i;
        console.log("MANAGEFEEDS: Got " + inEvent.feeds.length + " feeds. :)");
        this.feeds = inEvent.feeds;
        this.collection.destroyAll();
        for (i = 0; i < this.feeds.length; i += 1) {
            console.log("Feed " + i + ": " + JSON.stringify(this.feeds[i]));
            this.collection.add(this.feeds[i]);
        }
    },

    resizeHandler: function(){
    	//Calculate scroller height - if we don't explicitly set the scroller height, it will overflow the dialog
		var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    	var dialogHeightPC = this.domStyles.height.replace('%', '') / 100;
    	var dialogPadding = this.domStyles.padding.replace('px', '');

		var scrollerHeight = Math.round(windowHeight * dialogHeightPC) - (dialogPadding * 2);

    	this.$.ManageFeedsScroller.applyStyle("height", scrollerHeight + "px");

		//Calculate Window Width
		var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    	var dialogWidthPC = this.domStyles.width.replace('%', '') / 100;
    	
    	var groupboxWidth = Math.round(windowWidth * dialogWidthPC) - (dialogPadding * 2);
		this.$.newFeedName.applyStyle("width", (groupboxWidth - 90) + "px");
		this.$.newFeedURL.applyStyle("width", (groupboxWidth - 90) + "px");
		this.$.addNewFeedButton.applyStyle("width", groupboxWidth + "px");
		
		this.inherited(arguments);
	},

    closePopup: function (inSender, inEvent) {
    	//TODO: write back changes to service, refresh feeds if user has changed anything.
		this.clearNewFeed();
        this.hide();
    },

    closeDialog: function (inSender, inEvent) {
        this.$.warningDialog.hide();
        this.$.alertDialog.hide();
    },

    testNewFeed: function (inSender, inEvent) {
    	var newUrl = this.$.newFeedURL.getValue();
		if (newUrl.indexOf("http://ipkg.preware.org/alpha") == 0 || newUrl.indexOf("http://ipkg.preware.net/alpha") == 0)
		{
			this.$.alertDialog.show($L("Custom Feed"), $L("You may not add alpha testing feeds here. See http://testing.preware.net/"));
		}
		else if (newUrl.indexOf("http://ipkg.preware.org/beta") == 0 || newUrl.indexOf("http://ipkg.preware.net/beta") == 0)
		{
			this.$.alertDialog.show($L("Custom Feed"), $L("You may not add beta testing feeds here. See http://testing.preware.net/"));
		}
		else if (((newUrl.indexOf("http://ipkg.preware.org/feeds") == 0) || (newUrl.indexOf("http://ipkg.preware.net/feeds") == 0)) &&
				 (newUrl.indexOf("/testing/") > 0))
		{
			this.$.alertDialog.show($L("Custom Feed"), $L("The instructions you are following are obsolete. See http://testing.preware.net/"));
		}
		else if (newUrl.indexOf("http://preware.is.awesome.com") == 0)
		{
			this.$.alertDialog.show($L("Custom Feed"), $L("The instructions you are following are obsolete. See http://testing.preware.net/"));
		}
		else if (this.$.newFeedName.getValue() != '' &&
				 newUrl != '' && newUrl != 'http://')
		{
			if (!this.warningOkd)
			{
				this.$.warningDialog.show($L("Custom Feed"),$L("By adding a custom feed, you take full responsibility for any and all potential outcomes that may occur as a result of doing so, including (but not limited to): loss of warranty, loss of all data, loss of all privacy, security vulnerabilities and device damage."));
			}
			else
			{
				this.addNewFeed();
			}
		}
		else
		{
			this.$.alertDialog.show($L("Custom Feed"), $L("You need to fill in all fields for a new feed."));
		}
    },
    
    okWarning: function (inSender, inEvent) {
    	this.$.warningDialog.hide();
    	this.warningOkd = true;
    	this.addNewFeed();
    },
    
    addNewFeed: function (inSender, inEvent) {
        preware.IPKGService.addConfig(this.addNewFeedResponse.bind(this), this.$.newFeedName.getValue() + ".conf", this.$.newFeedName.getValue(), this.$.newFeedURL.getValue(), this.$.newFeedCompressedToggle.getValue());
    },
    
	addNewFeedResponse: function (payload) {
		if (payload.stage == 'completed')
		{
			// tell packages the feeds are "dirty"
			preware.PackagesModel.dirtyFeeds = true;
		
			this.clearNewFeed();

			// init feed loading
			preware.IPKGService.list_configs(preware.FeedsModel.onConfigs.bind(preware.FeedsModel));
		}
    },

	clearNewFeed: function() {
		this.$.newFeedName.setValue("");
        this.$.newFeedURL.setValue("http://");
        this.$.newFeedCompressedToggle.setValue(false);
	},
	
    checkFocus: function(source, event) {
		source.applyStyle("color", "black");
	},

	checkBlur: function(source, event) {
		source.applyStyle("color", "white");
	}
});
