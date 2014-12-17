enyo.kind({
	name: "Preware.ChoiceDialog",
	kind: "onyx.Popup",
	modal: false,
	autoDismiss: false,
	floating: true,
	centered: true,
	scrim: true,
	
	style: "padding: 15px; width: 80%; max-width: 300px",
	
	published: {
		title: "",
		body: ""
	},
	bindings: [
	    { from: ".title", to: ".$.dialogTitle.content" },
	    { from: ".body", to: ".$.dialogBody.content" }
	],
	
	events: {
		onDismiss: "",
		onAction: "",		
	},
	
	components: [
		{name: "dialogTitle", style: "font-weight: bold"},
		{tag: "hr"},
		{name: "dialogBody", allowHtml: true},
		{components: [
			{kind: "onyx.Button", style: "margin-top: 10px; margin-right: 5%; width: 45%", classes: "onyx-affirmative", content: $L("Ok"), ontap: "chooseYes"},
			{kind: "onyx.Button", style: "margin-top: 10px; margin-left: 5%; width: 45%", classes: "onyx-negative", content: $L("Cancel"), ontap: "chooseNo"}
		]}
	],
	
	show: function(data) {
		this.returnData = data;
		
		this.inherited(arguments);
	},
	
	chooseNo: function(){
		this.doDismiss();
	},
	
	chooseYes: function(){
		this.doAction({data: this.returnData});
	}
})