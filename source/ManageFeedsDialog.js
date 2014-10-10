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
                {tag: "div", classes: "webosstyle-groupbox-header", content: $L("New Feed")},
                {tag: "div", classes: "webosstyle-groupbox-body", style: "width: 100%", components:[
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{kind: "onyx.InputDecorator", style: "width: 100%;", components: [
							{kind: "onyx.Input", name: "newFeedName", style: "width: 100%; color: white", placeholder: $L("Name"), onfocus: "checkFocus", onblur: "checkBlur" }
						]},
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{kind: "onyx.InputDecorator", style: "width: 100%;", components: [
							{kind: "onyx.Input", name: "newFeedURL", style: "width: 100%;  color: white", placeholder: $L("URL"), value: "http://", onfocus: "checkFocus", onblur: "checkBlur" }
						]},
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-toggle", content: $L("Compressed"), fit: true},
						{kind: "onyx.ToggleButton", name: "newFeedCompressedToggle"}
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", style:"text-align: center", components: [
						{name: "addNewFeedButton", kind: "onyx.Button", classes: "onyx-affirmative", content: $L("Add Feed"), ontap: "addNewFeed"}
					]}
                ]}
            ]},
        ]},
        {tag: "div", style:"width: 100%; text-align: center", components: [
        	{kind: "onyx.Button", classes: "onyx-affirmative", style: "margin:5px; width: 18%; min-width: 100px; font-size: 18px;", content: $L("Close"), ontap: "closePopup"}
        ]}
        /*{
            kind: "enyo.Scroller",
            horizontal: "hidden",
            classes: "enyo-fill",
            //style: "background-image:url('assets/bg.png')",
            touch: true,
            fit: true,
            components: [
                {name: "CategoryRepeater", kind: "Repeater", onSetupItem: "setupCategoryItem", count: 0, components: [
                    {kind: "ListItem", content: "Category", ontap: "categoryTapped"}
                ]},
                {kind: "onyx.Groupbox", components: [
                    {kind: "onyx.GroupboxHeader", content: $L("New Feed")},
                    {kind: "onyx.InputDecorator", components: [
                        {kind: "onyx.TextArea", name: "newFeedName", hint: $L("Name") }
                    ]},
                    {kind: "onyx.InputDecorator", components: [
                        {kind: "onyx.TextArea", name: "newFeedURL", hint: $L("URL"), content: "http://" }
                    ]},
                    {kind: "enyo.FittableColumns", components: [
                        {tag: "div", content: $L("Compressed"), fit: true},
                        {kind: "onyx.ToggleButton", name: "newFeedCompressedToggle"}
                    ]},
                    {kind: "onyx.Button", style: "margin:5px;font-size:24px;float:center;", content: $L("Add Feed"), ontap: "addNewFeed"}
                ]}, //end of action group
                {kind: "onyx.Button", style: "margin:5px;font-size:24px;float:center;", content: $L("Close"), ontap: "closePopup"}
            ]
        }*/
    ],
    create: function (inSender, inEvent) {
        this.inherited(arguments);
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
    	
    	var buttonWidth = Math.round(windowWidth * dialogWidthPC) - (dialogPadding * 2);
		this.$.addNewFeedButton.applyStyle("width", buttonWidth + "px");
		
		this.inherited(arguments);
	},
    //handlers
    onFeeds: function (inSender, inEvent) {
        var i;
        console.log("MANAGEFEEDS: Got " + inEvent.feeds.length + " feeds. :)");
        this.feeds = inEvent.feeds;
        for (i = 0; i < this.feeds.length; i += 1) {
            console.log("Feed " + i + ": " + JSON.stringify(this.feeds[i]));
        }
    },
    closePopup: function (inSender, inEvent) {
        this.hide();
    },
    addNewFeed: function (inSender, inEvent) {
        var feed = {
            config: this.$.newFeedName.getValue() + ".conf",
            name: this.$.newFeedName.getValue(),
            url: this.$.newFeedURL.getValue(),
            gzipped: this.$.newFeedCompressedToggle.getValue()
        };
        //TODO: what to do with new feed? urgs..
    },
    checkFocus: function(source, event) {
		source.applyStyle("color", "black");
	},
	checkBlur: function(source, event) {
		source.applyStyle("color", "white");
	}
});
