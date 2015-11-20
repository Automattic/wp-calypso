// External Dependencies
var keyMirror = require( 'react/lib/keyMirror' );

module.exports.MAX_TAGS = 1000;
module.exports.MAX_TAGS_SUGGESTIONS = 20;

module.exports.action = keyMirror( {
	RECEIVE_TERMS: null,
	FETCH_CATEGORIES: null,
	SET_CATEGORY_QUERY: null,
	RECEIVE_ADD_TERM: null,
	CREATE_TERM: null,
	FETCH_TAGS: null,
	SET_CATEGORY_SELECTED_ITEMS: null
} );
