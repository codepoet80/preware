/*jslint sloppy: true */
/*global enyo */

enyo.singleton({
    name: "Backhandler",
    components: [
        {
            kind: "Signals",
            onbackbutton: "handleBackGesture"
        }
    ],
    backhandlers: [],

    handleBackGesture: function (inSender, inEvent) {
        var result = false, callback;

        while (!result && this.backhandlers.length > 0) {
            callback = this.backhandlers.pop();
            if (callback) {
                result = callback(inSender, inEvent);
            }
        }

        inEvent.preventDefault();
        return true;
    },
    registerBack: function (callback) {
        this.backhandlers.push(callback);
    }
});
