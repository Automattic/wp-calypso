//var debug = require( 'debug' )( 'calypso:reader-site-store' );

// External Dependencies
var Immutable = require( 'immutable' ),
	omit = require( 'lodash/omit' ),
	has = require( 'lodash/has' );

// Internal Dependencies
var Dispatcher = require( 'dispatcher' ),
	Emitter = require( 'lib/mixins/emitter' ),
	SiteStoreActionType = require( './constants' ).action,
	FeedStoreActionType = require( 'lib/feed-store/constants' ).action,
	State = require( './constants' ).state;

var sites = {}, SiteStore;

SiteStore = {
	get: function( siteId ) {
		return sites[ siteId ];
	}
};

Emitter( SiteStore ); //eslint-disable-line

SiteStore.setMaxListeners( 100 );

function setSite( attributes ) {
	var site = sites[ attributes.ID ], newSite;

	if ( ! attributes.state ) {
		attributes.state = State.COMPLETE;
	}

	attributes.has_featured = has( attributes, 'meta.links.featured' );

	attributes = omit( attributes, [ 'meta', '_headers' ] );

	if ( attributes.URL ) {
		attributes.domain = attributes.URL.replace( /^https?:\/\//, '' );
		attributes.slug = attributes.domain.replace( /\//g, '::' );
	}
	attributes.title = attributes.name ? attributes.name : attributes.domain;

	// If a WordPress.com site has a mapped domain create a `wpcom_url`
	// attribute to allow site selection with either domain.
	if ( attributes.options && attributes.options.is_mapped_domain && ! attributes.is_jetpack ) {
		attributes.wpcom_url = attributes.options.unmapped_url.replace( /^https?:\/\//, '' );
	}

	// If a site has an `is_redirect` property use the `unmapped_url`
	// for the slug and domain to match the wordpress.com original site.
	if ( attributes.options && attributes.options.is_redirect ) {
		attributes.slug = attributes.options.unmapped_url.replace( /^https?:\/\//, '' );
		attributes.domain = attributes.slug;
	}

	if ( site ) {
		newSite = site.mergeDeep( attributes );
	} else {
		newSite = Immutable.fromJS( attributes );
	}

	if ( newSite === site ) {
		// no change, bail
		return;
	}

	sites[ attributes.ID ] = newSite;

	SiteStore.emit( 'change' );
}

SiteStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload && payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case SiteStoreActionType.RECEIVE_FETCH:
			if ( action.error ) {
				setSite( {
					ID: action.siteId,
					state: State.ERROR,
					error: action.error
				} );
			} else {
				setSite( action.data );
			}
			break;
		case FeedStoreActionType.RECEIVE_FETCH:
			// check to see if the feed fetch had site meta
			if ( action.data && action.data.meta && action.data.meta.data && action.data.meta.data.site ) {
				setSite( action.data.meta.data.site );
			}
			break;
	}
} );

module.exports = SiteStore;
