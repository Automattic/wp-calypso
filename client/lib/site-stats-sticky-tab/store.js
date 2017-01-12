// External dependencies
var Dispatcher = require( 'dispatcher' ),
	Emitter = require( 'lib/mixins/emitter' ),
	store = require( 'store' ),
	merge = require( 'lodash/merge' );

// Internal dependencies
var constants = require( './constants' ),
	getStatsPathForTab = require( 'lib/route/path' ).getStatsPathForTab,
	sites = require( 'lib/sites-list' )(),
	_cachedPlace = getCachedPlace(),
	siteStatsStickyTabStore;

/**
 * @param  {[string]} tab      A label representative of a stats section behavior
 *                             * empty strings are stored as-is
 *                             * non-strings & `false` will be ignored
 *                             * prefixes like 'stats-*'' will be dropped
 *
 * @param  {[string]} slug     A site's domain (or suboptimally a siteId)
 *                             * empty strings are stored as-is
 *                             * non-strings & `false` will be ignored
 *
 * @return {[bool]}            true if something changed, false if not
 */
function saveMyPlace( tab, slug ) {
	var newPlace;

	if ( typeof tab !== 'string' ) {
		tab = false;
	}

	if ( typeof slug !== 'string' ) {
		slug = false;
	}

	if ( tab !== false && _cachedPlace.tab !== tab ) {
		newPlace = {
			tab: tab
		};
	}

	if ( slug !== false && _cachedPlace.slug !== slug ) {
		newPlace = newPlace || {};
		newPlace.slug = slug;
	}

	if ( newPlace ) {
		if ( newPlace.tab === 'insights' && ! ( newPlace.slug || _cachedPlace.slug ) ) {
			// It's currently an invalid state to have insights and no slug
			if ( _cachedPlace.tab === 'day' ) {
				return false;
			}
			newPlace.tab = 'day';
		}

		if ( newPlace.slug === '' && _cachedPlace.tab === 'insights' && ! newPlace.tab ) {
			newPlace.tab = 'day';
		}

		// Something changed, update the in-memory copy
		_cachedPlace = merge( _cachedPlace, newPlace );

		// And persist to disk
		store.set( constants.CACHE_KEY_MY_PLACE, _cachedPlace );
	}

	return !! newPlace;
}

function getCachedPlace() {
	var cached = store.get( constants.CACHE_KEY_MY_PLACE );
	if ( cached ) {
		return cached;
	}
	return {};
}

function handleSitesChange() {
	if ( sites.initialized && sites.fetched ) {
		// We only need to do this once after the sites list is built
		sites.off( 'change', handleSitesChange );

		siteStatsStickyTabStore.emit( 'change' );
	}
}

function getUrl() {
	var tab = _cachedPlace.tab,
		slug = _cachedPlace.slug,
		site;

	// The site in the store gets priority
	if ( slug ) {
		return getStatsPathForTab( tab, slug );
	}

	// The slug store is empty, is there a selected site?
	site = sites.getSelectedSite();
	if ( site && site.slug ) {
		slug = site.slug;
	}

	// an empty string here means include no slug in the link
	if ( ! slug && slug !== '' ) {
		// The user's primary site is last
		site = sites.getPrimary();
		if ( site && site.slug ) {
			slug = site.slug;
		}
	}

	return getStatsPathForTab( tab, slug );
}

siteStatsStickyTabStore = {
	getUrl: getUrl
};

Emitter( siteStatsStickyTabStore );

siteStatsStickyTabStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch( action.type ) {
		case constants.actions.RECEIVE_STATS_FILTER_AND_SLUG:
			if ( saveMyPlace( action.filter, action.slug ) ) {
				siteStatsStickyTabStore.emit( 'change' );
			}
			break;
		default:
	}
} );

sites.on( 'change', handleSitesChange );

module.exports = siteStatsStickyTabStore;
