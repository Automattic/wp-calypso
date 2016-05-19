/**
 * External dependencies
 */
const config = require( 'config' );

/**
 * Module variables
 */
const sections = [
	{
		name: 'me',
		paths: [ '/me' ],
		module: 'me',
		group: 'me',
		secondary: true
	},
	{
		name: 'account',
		paths: [ '/me/account' ],
		module: 'me/account',
		group: 'me',
		secondary: true
	},
	{
		name: 'security',
		paths: [ '/me/security' ],
		module: 'me/security',
		group: 'me',
		secondary: true
	},
	{
		name: 'purchases',
		paths: [ '/purchases' ],
		module: 'me/purchases',
		group: 'me',
		secondary: true
	},
	{
		name: 'billing',
		paths: [ '/me/billing' ],
		module: 'me/billing-history',
		group: 'me',
		secondary: true
	},
	{
		name: 'notification-settings',
		paths: [ '/me/notifications' ],
		module: 'me/notification-settings',
		group: 'me',
		secondary: true
	}
];

if ( config.isEnabled( 'help' ) ) {
	sections.push( {
		name: 'help',
		paths: [ '/help' ],
		module: 'me/help',
		secondary: true,
		group: 'me'
	} );
}

module.exports = sections;
