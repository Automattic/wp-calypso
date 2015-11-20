/**
 * External dependencies
 */
var assign = require( 'lodash/object/assign' ),
	debug = require( 'debug' )( 'calypso:tag-store' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	Emitter = require( 'lib/mixins/emitter' ),
	TermStore = require( './store' ),
	TermsConstants = require( './constants' );

/**
* Module Variables
*/

var _tagIds = {},
	_siteStatus = {},
	ActionTypes = TermsConstants.action;

var TagStore = {};

function ensureSiteHasStatus( siteId ) {
	if ( ! ( siteId in _siteStatus ) ) {
		_siteStatus[ siteId ] = {
			page: 1,
			isFetchingPage: false
		};
	}
}

function updateSiteStatus( siteId, values ) {
	debug( 'updateSiteStatus', siteId, values );
	ensureSiteHasStatus( siteId );
	assign( _siteStatus[ siteId ], values );
}

function updateNextPage( siteId, data ) {
	ensureSiteHasStatus( siteId );

	if ( data.found !== _tagIds[ siteId ].length && data.terms.length ) {
		debug( 'updateNextPage - site has next page', siteId, data );
		_siteStatus[ siteId ].page++;
	} else {
		debug( 'updateNextPage - site has no more pages', siteId, data );
		delete _siteStatus[ siteId ].page;
	}
}

function ensureTagIds( siteId ) {
	if ( ! ( siteId in _tagIds ) ) {
		_tagIds[ siteId ] = [];
	}
}

function receiveTags( siteId, tags ) {
	debug( 'receiveTags', siteId, tags );
	ensureTagIds( siteId );

	tags.forEach( function( tag ) {
		var tagId = tag.ID,
			existingIndex = _tagIds[ siteId ].indexOf( tagId );

		if ( -1 !== existingIndex ) {
			_tagIds[ siteId ].splice( existingIndex, 1, tagId );
		} else {
			_tagIds[ siteId ].push( tagId );
		}
	} );
}

TagStore._queryDefaults = {
	number: TermsConstants.MAX_TAGS,
	order_by: 'count',
	order: 'DESC'
};

TagStore.hasNextPage = function( siteId ) {
	return ! ( siteId in _siteStatus ) || !! _siteStatus[ siteId ].page;
};

TagStore.isFetchingPage = function( siteId ) {
	return ( siteId in _siteStatus ) && _siteStatus[ siteId ].isFetchingPage;
};

TagStore.get = function( siteId, tagId ) {
	return TermStore.get( siteId, tagId );
};

TagStore.all = function( siteId ) {
	var ids = _tagIds[ siteId ],
		tags;

	if ( ids ) {
		tags = ids.map( function( id ) {
			return TermStore.get( siteId, id );
		} );
	}

	return tags;
};

TagStore.getQueryParams = function( siteId ) {
	ensureSiteHasStatus( siteId );
	return assign(
		{},
		TagStore._queryDefaults,
		{ page: _siteStatus[ siteId ].page }
	);
};

Emitter( TagStore );

TagStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	Dispatcher.waitFor( [ TermStore.dispatchToken ] );

	switch ( action.type ) {
		case ActionTypes.FETCH_TAGS:
			if ( ! action.siteId ) {
				break;
			}

			updateSiteStatus( action.siteId, { isFetchingPage: true } );
			TagStore.emit( 'change' );
			break;

		case ActionTypes.RECEIVE_TERMS:
			if ( ! action.siteId ) {
				break;
			}
			updateSiteStatus( action.siteId, { isFetchingPage: false } );

			if ( action.error || ! action.data ) {
				break;
			}

			if ( action.data.termType !== 'tags' ) {
				break;
			}

			receiveTags( action.siteId, action.data.terms );
			updateNextPage( action.siteId, action.data );
			TagStore.emit( 'change' );
			break;
		default:
	}

	return true;
} );

module.exports = TagStore;
