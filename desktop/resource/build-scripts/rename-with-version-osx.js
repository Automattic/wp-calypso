'use strict';
/**
 * External Dependencies
 */
var fs = require( 'fs' );

/**
 * Internal dependencies
 */
var config = require( '../lib/config' );

fs.renameSync( './release/' + config.name + '.app.zip', './release/' + config.name + '.app.' + config.version + '.zip' );

// rename DMG file
fs.renameSync( './release/' + config.name + '-Installer.dmg', './release/' + config.name + '-Installer.' + config.version + '.dmg' );
