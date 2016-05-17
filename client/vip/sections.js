/**
 * External dependencies
 */
const config = require( 'config' );

/**
 * Module variables
 */
const sections = [];

if ( config.isEnabled( 'vip' ) ) {
	sections.push( {
		name: 'vip',
		paths: [ '/vip', '/vip/deploys', '/vip/billing', '/vip/support', '/vip/backups', '/vip/logs' ],
		module: 'vip',
		secondary: true
	} );
}

module.exports = sections;
