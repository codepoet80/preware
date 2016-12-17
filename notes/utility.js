/**
 * Created by doug on 12/18/16 from unused code.
 */

// condences bytes to a better rate
var formatSize = function (size) {
    var toReturn = size + $L(" B"),
        formatSize = size;

    if (formatSize > 1024) {
        formatSize = (Math.round((formatSize / 1024) * 100) / 100);
        toReturn = formatSize + $L(" KB");
    }
    if (formatSize > 1024) {
        formatSize = (Math.round((formatSize / 1024) * 100) / 100);
        toReturn = formatSize + $L(" MB");
    }
    // I don't think we need to worry about GB here...

    // return formatted size
    return toReturn;
};


// formats a url to something that can be a link
var getDomain = function (url) {
    var r = new RegExp("^(?:http(?:s)?://)?([^/]+)"),
        match = url.match(r),
        stripped;

    if (match) {
        stripped = match[1].replace(/www\./, '');
        return stripped;
    }
    return 'Link';
};

var removeAuth = function (str) {
    return str
        .replace(new RegExp('http://[^@/]+@', 'gm'), 'http://')
        .replace(new RegExp('https://[^@/]+@', 'gm'), 'https://')
        .replace(new RegExp('-H "Device-Id: [^"]+" ', 'gm'), "")
        .replace(new RegExp('-H "Auth-Token: [^"]+" ', 'gm'), "");
};

