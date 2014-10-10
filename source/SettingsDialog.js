/*jslint sloppy: true */
/*global enyo, onyx, preware, $L, formatDate, convertStringToBool */
//shows a dialog that allows the user to change settings.

//TODO: check if these settings really have an effect... ;)

enyo.kind({
    name: "SettingsDialog",
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
        {name: "SettingsScroller", kind: "enyo.Scroller", style: "width: 100%;", components: [
            {tag: "div", classes: "webosstyle-groupbox", components: [
                {tag: "div", classes: "webosstyle-groupbox-header", content: $L("Startup")},
                {tag: "div", classes: "webosstyle-groupbox-body", style: "width: 100%", components:[
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-picker", content: $L("Update Feeds"), fit: true},
						{kind: "onyx.PickerDecorator", onSelect: "updatePolicySelected", components: [
							{},
							{kind: "onyx.Picker", name: "updatePolicyPicker", style: "width: 200px;", components: [
								{content: $L("Every Launch"), value: "launch", active: true},
								{content: $L("Once Daily"), value: "daily"},
								{content: $L("Manually Only"), value: "manual"},
								{content: $L("Ask At Launch"), value: "ask"}
							]}
						]}
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", content: $L("Last Update"), fit: true},
						{kind: "enyo.Control", tag: "div", name: "lastUpdateField", content: $L("Never") }
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-toggle", content: $L("Scan unknown packages"), fit: true},
						{kind: "onyx.ToggleButton", name: "scanUnknownToggle", onChange: "scanUnknownChanged"}
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-toggle", content: $L("Check .ipk association"), fit: true},
						{kind: "onyx.ToggleButton", name: "checkIPKAssociationToggle", onChange: "checkIPKAssociationChanged"}
					]}
                ]}
            ]}, //end of startup group
            {tag: "div", classes: "webosstyle-groupbox", components: [
                {tag: "div", classes: "webosstyle-groupbox-header", content: $L("Actions")},
                {tag: "div", classes: "webosstyle-groupbox-body", style: "width: 100%", components:[
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-toggle", content: $L("Use App Tuckerbox"), fit: true},
						{kind: "onyx.ToggleButton", name: "useTuckerboxToggle", onChange: "useTuckerboxChanged"}
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-toggle", content: $L("Ignore device compat."), fit: true},
						{kind: "onyx.ToggleButton", name: "ignoreDeviceCompatToggle", onChange: "ignoreDeviceCompatChanged"}
					]}
                ]}
            ]}, //end of action group
            // we don't really do that on the 'main scene'. Maybe we will never.
            // {kind: "onyx.groupbox", components: [
                // {kind: "onyx.groupboxheader", content: $l("main scene")},
                // {kind: "enyo.fittablecolumns", components: [
                    // {tag: "div", content: $l("show available types"), fit: true},
                    // {kind:"onyx.togglebutton", onchange: "showavailabletypeschanged"}
                // ]}
            // ]}, //end of main scene group
            {tag: "div", classes: "webosstyle-groupbox", components: [
                {tag: "div", classes: "webosstyle-groupbox-header", content: $L("Package display")}, //formerly list scene
                {tag: "div", classes: "webosstyle-groupbox-body", style: "width: 100%", components:[
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-toggle", content: $L("Search Descriptions"), fit: true},
						{kind: "onyx.ToggleButton", name: "searchDescriptionsToggle", onChange: "searchDescriptionsChanged"}
					]},
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-picker", content: $L("Default sort"), fit: true},
						{kind: "onyx.PickerDecorator", onSelect: "sortPolicySelected", components: [
							{},
							{kind: "onyx.Picker", name: "sortPolicyPicker", style: "width: 200px;", components: [
								{content: $L("Category Default"), value: 'default', active: true},
								{content: $L("Alphabetically"), value: 'alpha'},
								{content: $L("Last Updated"), value: 'date'},
								{content: $L("Price"), value: 'price'}
							]}
						]}
					]},
					//we don't have a second row, right? Omitted that config.
					{kind: "enyo.FittableColumns", noStretch: true, classes: "settings-item", components: [
						{tag: "span", classes: "settings-title-toggle", content: $L("Installed is available"), fit: true},
						{kind: "onyx.ToggleButton", name: "installedIsAvailableToggle", onChange: "installIsAvailableChanged"}
					]}
                ]}
            ]} //end of list scene group
        ]},
        {tag: "div", style:"width: 100%; text-align: center", components: [
        	{kind: "onyx.Button", classes: "onyx-affirmative", style: "margin:5px; width: 18%; min-width: 100px; font-size: 18px;", content: $L("Close"), ontap: "closePopup"}
        ]}
    ],
    create: function (inSender, inEvent) {
        this.inherited(arguments);
        this.updateValues();
    },
    resizeHandler: function(){	
    	//Calculate scroller height - if we don't explicitly set the scroller height, it will overflow the dialog
		var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);   	
    	var dialogHeightPC = this.domStyles.height.replace('%', '') / 100;
    	var dialogPadding = this.domStyles.padding.replace('px', '');
		
		var scrollerHeight = Math.round(windowHeight * dialogHeightPC) - (dialogPadding * 2);
		
    	this.$.SettingsScroller.applyStyle("height", scrollerHeight + "px");

		this.inherited(arguments);
	},
    updateValues: function () {
        var i, items, cookie = preware.PrefCookie.get();

        if (!cookie) {
            enyo.error("SettingsDialog#updateValues: Cookie was empty.");
            return;
        }

        //string => bool conversion in the following is necessary, because "false" evaluates to true in JS.

        //startup group values:
        items = this.$.updatePolicyPicker.getClientControls();
        for (i = 0; i < items.length; i += 1) {
            if (items[i].value === cookie.updateInterval) {
                this.$.updatePolicyPicker.setSelected(items[i]);
                break;
            }
        }
        if (cookie.lastUpdate) {
            this.$.lastUpdateField.content = formatDate(cookie.lastUpdate);
        }
        this.$.scanUnknownToggle.setValue(convertStringToBool(cookie.fixUnknown));
        this.$.checkIPKAssociationToggle.setValue(convertStringToBool(cookie.resourceHandlerCheck));

        //actions group values:
        this.$.useTuckerboxToggle.setValue(convertStringToBool(cookie.useTuckerbox));
        this.$.ignoreDeviceCompatToggle.setValue(convertStringToBool(cookie.ignoreDevices));

        //package display group values:
        this.$.searchDescriptionsToggle.setValue(convertStringToBool(cookie.searchDesc));
        items = this.$.sortPolicyPicker.getClientControls();
        for (i = 0; i < items.length; i += 1) {
            if (items[i].value === cookie.listSort) {
                this.$.sortPolicyPicker.setSelected(items[i]);
                break;
            }
        }
        this.$.installedIsAvailableToggle.setValue(convertStringToBool(cookie.listInstalled));
    },
    //handlers
    closePopup: function (inSender, inEvent) {
        this.hide();
    },
    updatePolicySelected: function (inSender, inEvent) {
        preware.PrefCookie.put("updateInterval", inEvent.selected.value);
    },
    scanUnknownChanged: function (inSender, inEvent) {
        preware.PrefCookie.put("fixUnknown", inEvent.value);
    },
    checkIPKAssociationChanged: function (inSender, inEvent) {
        preware.PrefCookie.put("resourceHandlerCheck", inEvent.value);
    },
    useTuckerboxChanged: function (inSender, inEvent) {
        preware.PrefCookie.put("useTuckerbox", inEvent.value);
    },
    ignoreDeviceCompatChanged: function (inSender, inEvent) {
        preware.PrefCookie.put("ignoreDevices", inEvent.value);
    },
    showAvailableTypesChanged: function (inSender, inEvent) {
        preware.PrefCookie.put("showAvailableTypes", inEvent.value);
    },
    searchDescriptionsChanged: function (inSender, inEvent) {
        preware.PrefCookie.put("searchDesc", inEvent.value);
    },
    sortPolicySelected: function (inSender, inEvent) {
        preware.PrefCookie.put("listSort", inEvent.selected.value);
    },
    installIsAvailableChanged: function (inSender, inEvent) {
        preware.PrefCookie.put("listInstalled", inEvent.value);
    }
});
