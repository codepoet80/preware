#!/bin/bash


node enyo/tools/deploy.js -o deploy/org.webosinternals.preware

adb push deploy/org.webosinternals.preware /usr/palm/applications/org.webosinternals.preware
