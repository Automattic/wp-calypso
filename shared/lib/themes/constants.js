/**
 * External dependencies
 */
var assign = require( 'lodash/object/assign' ),
	keyMirror = require( 'react/lib/keyMirror' );

module.exports = assign( keyMirror( {

	// Action types
	RECEIVE_THEMES: null,
	QUERY_THEMES: null,
	RECEIVE_THEMES_SERVER_ERROR: null,
	INCREMENT_THEMES_PAGE: null,
	RECEIVE_CURRENT_THEME: null,
	PREVIEW_THEME: null,
	PURCHASE_THEME: null,
	ACTIVATE_THEME: null,
	ACTIVATED_THEME: null,
	CLEAR_ACTIVATED_THEME: null,
	SEARCH_THEMES: null,
	THEME_DETAILS: null,
	THEME_SUPPORT: null,
	THEME_CUSTOMIZE: null

} ), {

	// Misc. shared values
	PER_PAGE: 20,
	THEME_COMPONENT_HEIGHT: 300

} );
