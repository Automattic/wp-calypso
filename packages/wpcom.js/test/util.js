/**
 * Module dependencies
 */
var wpcomFactory = require( '../' );
var config;

try {
	config = require( './config' );
} catch ( ex ) {
	config = {};
}

/**
 * Detect client/server side
 */
const is_client_side = 'undefined' !== typeof window;

/**
 * Config vars
 */
const token = process.env.TOKEN || config.token;
const site = process.env.SITE || config.site;

module.exports = {
	wpcom: wpcom,
	wpcom_public: function() {
		return wpcomFactory();
	},
	site: function() {
		return site;
	}
};

function wpcom() {
	if ( is_client_side ) {
		let proxy = require( '../node_modules/wpcom-proxy-request' );
		let _wpcom = wpcomFactory( proxy );

		_wpcom.request( { metaAPI: { accessAllUsersBlogs: true } } )
			.then( () => console.log( 'proxy now running in "access all user\'s blogs" mode' ) );
		return _wpcom;
	} else {
		return wpcomFactory( token );
	}
}
