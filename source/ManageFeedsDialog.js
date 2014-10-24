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
        /*{name: "ManageFeedsScroller", touch: true, kind: "enyo.Scroller", style: "width: 100%;", components: [
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
								{name: "feedEnabledToggle", kind: "onyx.ToggleButton"}
							]}
						], bindings: [
							{from: ".model.name", to: ".$.feedName.content"},
							{from: ".model.url", to: ".$.feedURL.content"},
							{from: ".model.enabled", to: ".$.feedEnabledToggle.value", oneWay: false},
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
        ]},*/
        {name: "ManageFeedsList", kind: "AroundList", fit: true, count: 0, style:"width: 100%;", enableSwipe: true, percentageDraggedThreshold: 0.01, persistSwipeableItem: true, onSetupItem: "setupItem", onSetupSwipeItem: "setupSwipeItem", aboveComponents: [
		], components: [
			//TODO: Continue Tweaking
			{name: "feed", kind: "preware.FeedItem", classes: "list-sample-contacts-item", onRemove: "feedEnabledToggled"}
		],
		swipeableComponents: [
			{style: "height: 100%; background-color: darkgrey; text-align:center", components: [
				{name: "swipeableDeleteButton", kind: "onyx.Button", style: "margin-top: 10px; margin-right: 10px;", classes:"onyx-negative", ontap: "deleteButtonTapped", content: $L("Delete")},
				{name: "swipeableCancelButton", kind: "onyx.Button", style: "margin-left: 10px;", ontap: "cancelButtonTapped", content: $L("Cancel")}
			]}
		]},
        {tag: "div", style:"width: 100%; text-align: center", components: [
        	{kind: "onyx.Button", classes: "onyx-affirmative", style: "margin:5px; width: 18%; min-width: 100px; font-size: 18px;", content: $L("Close"), ontap: "closePopup"}
        ]},
        {name: "alertDialog", kind: Preware.AlertDialog, onDismiss: "closeDialog"},
        {name: "warningDialog", kind: Preware.ChoiceDialog, onAction: "okWarning", onDismiss: "closeDialog"},
    ],

    create: enyo.inherit(function (sup) {
		return function () {
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

		this.feeds = [];
		preware.IPKGService.list_configs(this.onFeeds.bind(this));
		
		this.inherited(arguments);
	},

    //handlers
    onFeeds: function(payload)
	{
		try 
		{
			if (!payload) 
			{
				// i dont know if this will ever happen, but hey, it might
				this.$.alertDialog.show('Preware', $L("Cannot access the service. First try restarting Preware, or reboot your device and try again."));
				this.doneLoading();
			}
			else if (payload.errorCode != undefined) 
			{
				// we probably dont need to check this stuff here,
				// it would have already been checked and errored out of this process
				if (payload.errorText == "org.webosinternals.ipkgservice is not running.")
				{
					this.$.alertDialog.show('Preware', $L("The service is not running. First try restarting Preware, or reboot your device and try again."));
					this.doneLoading();
				}
				else
				{
					this.$.alertDialog.show('Preware', payload.errorText);
					this.doneLoading();
				}
			}
			else 
			{
				// clear feeds array
				this.feeds = [];
			
				// load feeds
				for (var x = 0; x < payload.configs.length; x++)
				{
					var feedObj = {
						config: payload.configs[x].config,
						name: payload.configs[x].config.replace(/.conf/, ''),
						url: "",
						data: [],
						enabled: payload.configs[x].enabled
					};
				
					if (payload.configs[x].contents) {
						var tmpSplit1 = payload.configs[x].contents.split('<br>');
						for (var c = 0; c < tmpSplit1.length; c++)
						{
							if (tmpSplit1[c]) 
							{
								var tmpSplit2 = tmpSplit1[c].split(' ');
								feedObj.url = tmpSplit2[2];
								feedObj.data.push(tmpSplit2)
							}
						}
					}

					this.feeds.push(feedObj);
				}
			
				// sort them
				this.feeds.sort(function(a, b)
				{
					if (a.name && b.name)
					{
						return ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0));
					}
					else
					{
						return -1;
					}
				});
			
				this.doneLoading();
			}
		}
		catch (e)
		{
			console.log(e, 'configs#onFeeds');
			this.$.alertDialog.show('onFeeds Error', e);
		}
	},
	
	doneLoading: function()
	{
		try 
		{
			if (this.feeds.length > 0) 
			{
				this.$.ManageFeedsList.setCount(this.feeds.length);
				this.$.ManageFeedsList.refresh();
			}
		}
		catch (e)
		{
			console.log(e, 'configs#doneLoading');
			this.$.alertDialog.show('doneLoading Error', e);
		}
	},

	setupItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var item = this.feeds[i];
		
		//this.$.item.setContact(item);
		this.$.feed.setFeed(item);
				
		return true;
	},

	setupSwipeItem: function(inSender, inEvent) {
        // because setting it on the list itself fails:
        this.$.ManageFeedsList.setPersistSwipeableItem(true);
        this.activeItem = inEvent.index;
        this.swiping = true;
    },

	completeSwipeItem: function() {
        this.$.ManageFeedsList.completeSwipe();
        this.swiping = false;
    },

    deleteButtonTapped: function(inSender, inEvent) {
        this.$.ManageFeedsList.setPersistSwipeableItem(false);
        //this.sourceDeleted(this.activeItem); 
		this.completeSwipeItem();
    },

    cancelButtonTapped: function(inSender, inEvent) {
        this.$.ManageFeedsList.setPersistSwipeableItem(false);
		this.completeSwipeItem();
    },

    resizeHandler: function(){
    	//Calculate scroller height - if we don't explicitly set the scroller height, it will overflow the dialog
		var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    	var dialogHeightPC = this.domStyles.height.replace('%', '') / 100;
    	var dialogPadding = this.domStyles.padding.replace('px', '');

		var scrollerHeight = Math.round(windowHeight * dialogHeightPC) - (dialogPadding * 2);

    	this.$.ManageFeedsList.applyStyle("height", scrollerHeight + "px");

		//Calculate Window Width
		var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    	var dialogWidthPC = this.domStyles.width.replace('%', '') / 100;
    	
    	var groupboxWidth = Math.round(windowWidth * dialogWidthPC) - (dialogPadding * 2);
		//this.$.newFeedName.applyStyle("width", (groupboxWidth - 90) + "px");
		//this.$.newFeedURL.applyStyle("width", (groupboxWidth - 90) + "px");
		//this.$.addNewFeedButton.applyStyle("width", groupboxWidth + "px");
		
		this.inherited(arguments);
	},

	feedEnabledToggled: function (inSender, inEvent)
	{
		console.log("Ping!")
		//preware.IPKGService.setConfigState(function(){preware.PackagesModel.dirtyFeeds = true;}, inSender.attributes.config, inSender.attributes.enabled);
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
			preware.IPKGService.list_configs(this.onFeeds.bind(this));
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

// It's convenient to create a kind for the item we'll render in the contacts list.
enyo.kind({
	name: "preware.FeedItem",
	events: {
		onRemove: ""
	},
	published: {
		importance: 0
	},
	components: [
		{kind: "enyo.FittableRows", fit: true, components: [
		  {name: "feedName"},
		  {name: "feedURL", style: "font-size: 10px; color: LightGray"},
		]},
		{name: "remove", kind: "onyx.IconButton", classes: "list-sample-contacts-remove-button", src: "assets/folder.png", ontap: "removeTap"}
	],
	setFeed: function(inFeed) {
		this.$.feedName.setContent(inFeed.name);
		this.$.feedURL.setContent(inFeed.url);
		/*if(inFeed.enabled)
		{
			this.$.feedEnabledToggle.setContent($L("On"));
		}
		else
		{
			this.$.feedEnabledToggle.setContent($L("Off"));
		}*/
//		this.$.feedEnabledToggle.setValue(inFeed.enabled);
	},
	removeTap: function(inSender, inEvent) {
		this.doRemove(inEvent);
		return true;
	}
});

// It's convenient to create a kind for the item we'll render in the contacts list.
/*enyo.kind({
	name: "preware.FeedItem",
	events: {
		onRemove: ""
	},
	published: {
		importance: 0
	},
	components: [
		{classes: "settings-item-repeater", components: [
			{kind: "enyo.FittableRows", fit: true, components: [
				{name: "feedName"},
				{name: "feedURL", style: "font-size: 10px; color: LightGray"},
			]},
			{name: "feedEnabledToggle", kind: "onyx.Button", style: "float: right", onTap: "feedEnabledToggled" }
		]}
	],
	setFeed: function(inFeed) {
		this.$.feedName.setContent(inFeed.name);
		this.$.feedURL.setContent(inFeed.url);
		if(inFeed.enabled)
		{
			this.$.feedEnabledToggle.setContent($L("On"));
		}
		else
		{
			this.$.feedEnabledToggle.setContent($L("Off"));
		}
//		this.$.feedEnabledToggle.setValue(inFeed.enabled);
	},
	feedEnabledToggled: function (inSender, inEvent)
	{
		console.log("Ping!")
		//preware.IPKGService.setConfigState(function(){preware.PackagesModel.dirtyFeeds = true;}, inSender.attributes.config, inSender.attributes.enabled);
	},
	removeTap: function(inSender, inEvent) {
		this.doRemove(inEvent);
		return true;
	}
});*/