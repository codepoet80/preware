/*jslint sloppy: true, continue:true */
/*global enyo, window, device, console, preware, $L, setTimeout, clearTimeout, setTimeout */

enyo.singleton({
	name: "UpdateFeeds",
	// required ipkgservice
	ipkgServiceVersion: 14,
	downloaded: false,
	onlyLoad: false,
	timeouts: [],
	components: [
		{
			kind: "Signals",
			onPackagesLoadFinished: "donePackageParsing",
			onLoadFeedsFinished: "doneLoadingFeeds"
		}
	],

	//emited signals:
	// onUpdateFeedsFinished: {} //emitted when loading is finished.

	//Handlers
	//this is called from FeedsModel after we loaded the feed configuration from disk.
	//This is triggered from multiple occasions:
	//one is right before feed update
	//the other one is if we just load the feeds without update.
	doneLoadingFeeds: function (inSender, inEvent) {
		this.log("loaded feeds: " + JSON.stringify(inEvent));
		this.feeds = inEvent.feeds;

		if (this.downloaded || this.onlyLoad || !this.hasNet) {
			this.log("Not downloading, because onlyLoad: " + this.onlyLoad + " and alreadyDownloaded: " + this.downloaded + " and hasNet: " + this.hasNet) ;
			this.parseFeeds(inSender, inEvent);
		} else {
			this.log("Downloading feeds...");
			if (this.feeds.length) {
				this.log("Starting download of first feed.");
				this.downloadFeedRequest(0);
			} else {
				this.log("Not downloading feeds, length: " + this.feeds.length);
				this.downloaded = true;
				this.loadFeeds(); //let ipkg service load the feeds again.
			}
		}
	},
	donePackageParsing: function (inSender, inEvent) {
		//this is the end of the update process.. trigger parent.
		enyo.Signals.send("onUpdateFeedsFinished", {});
	},

	//Action Functions
	log: function (text) {
		console.error(text);
	},

	//Unused functions... ??
	versionTap: function (inSender, inEvent) {
		preware.IPKGService.version(this.gotVersion.bind(this));
		this.log("Getting Version");
	},
	gotVersion: function (version) {
		this.log("Version: " + JSON.stringify(version) + "<br>");
	},
	machineName: function () {
		preware.IPKGService.getMachineName(this.gotMachineName.bind(this));
		this.log("Requesting Machine Name");
	},
	gotMachineName: function (machineName) {
		this.log("Got Machine Name: " + machineName + " (" + JSON.stringify(machineName) + ")");
	},


	//start the update process.
	//first we need some device information.
	//we need device profile and palm profile for a call to
	//IPKGService.setAuthParams. This probably is necessary for
	//App Catalog apps...?
	//If that does not work, we just get the machine name and are done.
	startUpdateFeeds: function (force) {
		if (window.PalmServiceBridge === undefined) {
			this.log("No PalmServiceBridge found.");
		} else {
			this.log("PalmServiceBridge found.");
		}

        if (!window.device) {
            window.device = {};
        }
        
		this.log("device.version: " + (device ? device.version : "undefined"));
		this.log("device.name: " + (device ? device.name : "undefined"));

		switch (preware.PrefCookie.get().updateInterval) {
		case "launch":
			this.onlyLoad = false;
			break;
		case "manual":
			this.onlyLoad = true;
			break;
		case "daily":
			var lastUpdate = preware.PrefCookie.get().lastUpdate,
				dateLastUpdate,
				dateNow = new Date();
			if (lastUpdate === 0 || lastUpdate === "0") {
				this.onlyLoad = false;
			} else {
				dateLastUpdate = new Date(lastUpdate * 1000);
				if (dateLastUpdate.getYear() === dateNow.getYear()
						&& dateLastUpdate.getMonth() === dateNow.getMonth()
						&& dateLastUpdate.getDate() === dateNow.getDate()) {
					this.log("Already updated feeds today, don't do it again. Dates: " + dateLastUpdate + " and " + dateNow);
					this.onlyLoad = true;
				} else {
					this.log("Not updated feeds today, do it again. Dates: " + dateLastUpdate + " and " + dateNow);
					this.onlyLoad = false;
				}
			}
			break;
		case "ask":
			this.log("Ask not yet implemented! Falling back to manual.");
			this.onlyLoad = true;
			break;
		default:
			this.onlyLoad = true;
			break;
		}

		if (force) {
			this.log("Forced to download, will download anyway.");
			this.onlyLoad = false;
		}

		this.log("Start Loading Feeds");
		this.downloaded = false;
		preware.DeviceProfile.getDeviceProfile(this.gotDeviceProfile.bind(this), false);
	},

	gotDeviceProfile: function (inSender, inEvent) {
		this.log("Got Device Profile: " + (inEvent ? inEvent.success : ""));
		if (!inEvent.success || !inEvent.deviceProfile) {
			this.log("Failed to get device profile.");
			preware.IPKGService.getMachineName(this.onDeviceType.bind(this));
			this.log("Requesting Machine Name.");
		} else {
			this.log("Got deviceProfile: " + JSON.stringify(inEvent.deviceProfile));
			this.deviceProfile = inEvent.deviceProfile;
			preware.PalmProfile.getPalmProfile(this.gotPalmProfile.bind(this), false);
		}
	},
	gotPalmProfile: function (inSender, inEvent) {
		if (!inEvent.success || !inEvent.palmProfile) {
			this.log("failed to get palm profile");
			preware.IPKGService.getMachineName(this.onDeviceType.bind(this));
			this.log("Requesting Machine Name");
		} else {
			this.log("Got palmProfile.");
			this.palmProfile = inEvent.palmProfile;
			preware.IPKGService.setAuthParams(this.authParamsSet.bind(this),
					this.deviceProfile.deviceId,
					this.palmProfile.token);
		}
	},
	authParamsSet: function (inResponse) {
		this.log("Got authParams: " + JSON.stringify(inResponse));
		preware.IPKGService.getMachineName(this.onDeviceType.bind(this));
		this.log("Requesting Machine Name");
	},

	//if we reached here, we got all the configuration stuff we needed.
	onDeviceType: function (inResponse) {
		this.log("Got machine name: " + JSON.stringify(inResponse));

		if (!this.onlyLoad) {
			// start by checking the internet connection
			this.log("Requesting Connection Status");
			var request = new enyo.ServiceRequest({
				service: "palm://com.palm.connectionmanager/",
				method: "getstatus"
			});
			request.response(this, this.onConnection);
			request.error(this, this.onConnection);
			request.go();
		} else {
			this.loadFeeds();
		}
	},
	//connection check happens before download. If no connection, only existing feeds will be loaded.
	onConnection: function (inSender, inResponse) {
		this.hasNet = false;
		if (inResponse && inResponse.returnValue === true &&
				(inResponse.isInternetConnectionAvailable === true ||
					(inResponse.wifi && inResponse.wifi.state === "connected"))) {
			this.hasNet = true;
		}
		this.log("Got Connection Status. Connection: " + this.hasNet);
		this.log("Complete Response: " + JSON.stringify(inResponse));

		// run version check
		this.log("Run Version Check");
		preware.IPKGService.version(this.onVersionCheck.bind(this));
	},
	onVersionCheck: function (payload) {
		this.log("Version Check Returned: " + JSON.stringify(payload));
		try {
			// log payload for display
			preware.IPKGService.logPayload(payload, 'VersionCheck');

			if (!payload) {
				// i dont know if this will ever happen, but hey, it might
				this.log($L("Cannot access the service. First try restarting Preware, or reboot your device and try again."));
			} else if (payload.errorCode !== undefined) {
				if (payload.errorText === "org.webosinternals.ipkgservice is not running.") {
					this.log($L("The service is not running. First try restarting Preware, or reboot your device and try again."));
				} else {
					this.log(payload.errorText);
				}
			} else {
				if (payload.apiVersion && payload.apiVersion < this.ipkgServiceVersion) {
					// this is if this version is too old for the version number stuff
					this.log($L("The service version is too old. First try rebooting your device, or reinstall Preware and try again."));
				} else {
					this.downloaded = false;
					this.error = false;
					this.loadFeeds(); //load feed configuration anyway. Result will decide what do next..
				}
			}
		} catch (e) {
			this.log("app#onVersionCheck: " + e);
		}
	},

	//trigger update of one feed:
	downloadFeedRequest: function (num) {
		this.log("=================== downloadFeedRequest: " + num);
		// update display
		enyo.Signals.send("onPackagesStatusUpdate", {message: $L("<strong>Downloading Feed Information</strong><br>") + this.feeds[num].name});

		// subscribe to new feed
		preware.IPKGService.downloadFeed(this.downloadFeedResponse.bind(this, num),
										this.feeds[num].gzipped, this.feeds[num].name, this.feeds[num].url);

		var start = Date.now(), tries = 0;
		function preventTimeout() {
			var checkTime = Date.now(), diffInSec = (checkTime - start) / 1000;
			this.log("Waiting for result for feed " + num + " since " + diffInSec + " with " + tries + " tries already failed.");
			if (tries < 5) {
				if (diffInSec > 30) {
					preware.IPKGService.downloadFeed(this.downloadFeedResponse.bind(this, num),
											this.feeds[num].gzipped, this.feeds[num].name, this.feeds[num].url);
					start = checkTime;
					tries += 1;
				}
				this.timeouts[num] = setTimeout(preventTimeout.bind(this), 1000);
			} else {
				this.downloadFeedResponse(num, {stage: "failed", errorText: "Download timed out."});
			}
		}
		this.timeouts[num] = setTimeout(preventTimeout.bind(this), 1000);
		this.log("Startet timeout check with id " + this.timeouts[num]);
	},
	downloadFeedResponse: function (num, payload) {
		var goToNextFeed = function() {
			this.log("Clearing timeout: " + this.timeouts[num]);
			clearTimeout(this.timeouts[num]);
			num = num + 1;
			if (num < this.feeds.length) {
				// start next
				this.downloadFeedRequest(num);
			} else {
				// we're done
				var msg = "<strong>" + $L("Done Downloading!") + "</strong>";
				if (this.error) {
					msg += "<br>" + $L("Some feeds failed to download.");
					setTimeout(this.loadFeeds.bind(this), 5000);
				} else {
					// well updating looks to have finished, lets log the date:
					this.log("Putting " + Math.round(Date.now() / 1000) + " as lastUpdate");
					preware.PrefCookie.put('lastUpdate', Math.round(Date.now() / 1000));
					this.loadFeeds();
				}
				enyo.Signals.send("onPackagesStatusUpdate", {message: msg});

				this.downloaded = true;
			}
		};

		this.log("DownloadFeedResponse: " + num + ", payload: " + JSON.stringify(payload));
		if (!payload.returnValue || payload.stage === "failed") {
			this.log(payload.errorText + '<br>' + (payload.stdErr ? payload.stdErr.join("<br>") : ""));
			this.error = true;

			goToNextFeed.call(this);
		} else if (payload.stage === "status") {
			enyo.Signals.send("onPackagesStatusUpdate", {message: $L("<strong>Downloading Feed Information</strong><br>") + this.feeds[num].name + "<br><br>" + payload.status});
		} else if (payload.stage === "completed") {
			goToNextFeed.call(this);
		}
	},
	loadFeeds: function () {
		// lets call the function to update the global list of pkgs
		enyo.Signals.send("onPackagesStatusUpdate", {message: $L("<strong>Loading Package Information</strong><br>")});
		preware.FeedsModel.loadFeeds();
	},
	parseFeeds: function (inSender, inEvent) {
		console.log("Starting PackagesModel.loadFeeds");
		preware.PackagesModel.loadFeeds(inEvent.feeds, this.onlyLoad);
	}
});
