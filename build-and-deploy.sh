#!/bin/bash


node enyo/tools/deploy.js -o deploy/org.webosports.app.preware

adb push deploy/org.webosports.app.preware /usr/palm/applications/org.webosports.app.preware
adb shell systemctl restart luna-next
adb forward tcp:1122 tcp:1122
