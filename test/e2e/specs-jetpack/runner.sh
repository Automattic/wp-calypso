#!/bin/bash
export JETPACKHOST=PRESSABLE
export TARGET=JETPACK

eval "./node_modules/.bin/concurrently 'JETPACKUSER=goDaddyJetpackUser ./node_modules/.bin/mocha ./specs-jetpack/connect-disconnect-spec.js' 'JETPACKUSER=asoJetpackUser ./node_modules/.bin/mocha ./specs-jetpack/connect-disconnect-spec.js' 'JETPACKUSER=goDaddyJetpackUserSub ./node_modules/.bin/mocha ./specs-jetpack/connect-disconnect-spec.js' 'JETPACKUSER=bluehostJetpackUser ./node_modules/.bin/mocha ./specs-jetpack/connect-disconnect-spec.js' 'JETPACKUSER=bluehostJetpackUserSub ./node_modules/.bin/mocha ./specs-jetpack/connect-disconnect-spec.js' 'JETPACKUSER=siteGroundJetpackUser ./node_modules/.bin/mocha ./specs-jetpack/connect-disconnect-spec.js'"
