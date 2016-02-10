/**
 * External dependencies
 */
var page = require( 'page' ),
	transform = require( 'lodash/object/transform' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	user = require( 'lib/user' )(),
	controller = require( 'my-sites/controller' ),
	themesController = require( './controller' );

const routing = {
	routes: [
		{ value: '/design/:site_id', enableLoggedOut: false },
		{ value: '/design/type/:tier/:site_id', enableLoggedOut: false },
		{ value: '/design/type/:tier', enableLoggedOut: true },
		{ value: '/design', enableLoggedOut: true },
	],
	middlewares: [
		{ value: controller.navigation, enableLoggedOut: false },
		{ value: controller.siteSelection, enableLoggedOut: false },
		{ value: themesController.themes, enableLoggedOut: true },
	]
};

function getRouting( isLoggedIn ) {
	const testKey = isLoggedIn ? 'value' : 'enableLoggedOut';
	return transform( routing, ( acc, collection, collectionName ) => {
		acc[ collectionName ] = collection
			.filter( item => item[ testKey ] )
			.map( item => item.value );
	} );
}

function loadPage( controller, ...middlwares ) {
	// run middlewares, save context in route state
	// run controller, dispatch either a route action or redux action to update the layout with the returned element
}


module.exports = function( router ) {
	if ( config.isEnabled( 'manage/themes' ) ) {
		router.add( { name: '/design', path: '/design', onActivate: ( dispatch ) => dispatch( loadPage( themesController.themes ) ) } );
	}
};
