// __mocks__/config.js

const config = jest.createMockFromModule( 'config' );

const values = {
	artifacts: {
		screenshot: 'screenshots',
		video: 'screenshots/videos',
		log: '.',
	},
	viewportName: 'desktop',
	locale: 'en',
	viewportSize: {
		mobile: {
			width: 400,
			height: 1000,
		},
		tablet: {
			width: 1024,
			height: 1000,
		},
		desktop: {
			width: 1440,
			height: 1000,
		},
		laptop: {
			width: 1440,
			height: 790,
		},
	},
	calypsoBaseURL: 'https://wordpress.com',
	testAccounts: {
		basicUser: [ 'wpcomuser', 'hunter2', 'wpcomuser.wordpress.com' ],
		advancedUser: [ 'advancedwpcomuser', 'azurediamond', 'advancedwpcomuser.wordpress.com' ],
		noURLUser: [ 'nourluser', 'password1234' ],
	},
};

/**
 * Mocks the `get` call provided by the node-config module.
 *
 * @param {string} key The key in the JSON to retrieve.
 * @returns {string | [key: string]: string} Either a string value or key/value object.
 */
function get( key ) {
	return values[ key ];
}

config.get = get;

export default config;
