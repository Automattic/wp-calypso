/**
 * External dependencies
 */
import debugModule from 'debug';
import store from 'store';
import assign from 'lodash/assign';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Site from 'lib/site';
import JetpackSite from 'lib/site/jetpack';
import Searchable from 'lib/mixins/searchable';
import Emitter from 'lib/mixins/emitter';
import { isPlan } from 'lib/products-values';
import userUtils from 'lib/user/utils';
import { withoutHttp } from 'lib/url';

const debug = debugModule( 'calypso:sites-list' );

/**
 * SitesList component
 *
 * @api public
 */
function SitesList() {
	if ( ! ( this instanceof SitesList ) ) {
		return new SitesList();
	}

	this.initialized = false; // false until data comes from api or localStorage
	this.fetched = false; // false until data comes from api
	this.fetching = false;
	this.selected = null;
	this.propagateChange = this.propagateChange.bind( this );
}

/**
 * Mixins
 */
Emitter( SitesList.prototype );
Searchable( SitesList.prototype, [ 'name', 'URL' ] );

/**
 * Get list of sites from current object or store,
 * trigger fetch on first request to update stale data
 */
SitesList.prototype.get = function() {
	var data;
	if ( ! this.data ) {
		debug( 'First time loading SitesList, check store' );
		data = store.get( 'SitesList' );
		if ( data ) {
			this.initialize( data );
		} else {
			this.data = [];
		}
		this.fetch();
	}
	return this.data;
};

/**
 * Fetch the user's sites from WordPress.com via the REST API.
 *
 * @api public
 */
SitesList.prototype.fetch = function() {
	if ( ! userUtils.isLoggedIn() || this.fetching || this.ignoreUpdates ) {
		return;
	}

	this.fetching = true;

	debug( 'getting SitesList from api' );

	wpcom.me().sites( { site_visibility: 'all', include_domain_only: true }, function( error, data ) {
		if ( error ) {
			debug( 'error fetching SitesList from api', error );
			this.fetching = false;

			return;
		}

		if ( this.ignoreUpdates ) {
			this.fetching = false;
			return;
		}

		this.sync( data );
		this.fetching = false;
	}.bind( this ) );
};

// FOR NUCLEAR AUTOMATED TRANSFER OPTION
// See: https://github.com/Automattic/wp-calypso/pull/10986
SitesList.prototype.pauseFetching = function() {
	this.ignoreUpdates = true;
};
SitesList.prototype.resumeFetching = function() {
	this.ignoreUpdates = false;
};

SitesList.prototype.sync = function( data ) {
	debug( 'SitesList fetched from api:', data.sites );

	let sites = this.parse( data );
	if ( ! this.initialized ) {
		this.initialize( sites );
		this.fetched = true;
		this.emit( 'change' );
	} else {
		let changed = this.transaction( this.update, sites );
		if ( changed || ! this.fetched ) {
			this.fetched = true;
			debug( 'SitesList changed via update' );
			this.emit( 'change' );
		}
	}
	store.set( 'SitesList', sites );
};

/**
 * Initialize data with Site objects
 **/
SitesList.prototype.initialize = function( sites ) {
	var allSingleSites = true;
	this.markCollisions( sites );
	this.data = sites.map( function( site ) {
		var siteObj = this.createSiteObject( site );
		if ( ! site.single_user_site ) {
			allSingleSites = false;
		}
		siteObj.on( 'change', this.propagateChange );
		return siteObj;
	}, this );
	this.allSingleSites = allSingleSites;
	this.initialized = true;
};

/**
 * Create site Object
 **/
SitesList.prototype.createSiteObject = function( site ) {
	/**
	 * Jetpack sites require additional methods that are irrelevant
	 * for other Sites, so we use a separate object model that inherits
	 * from the base Site model and extends it.
	 */
	if ( site.jetpack ) {
		return JetpackSite( site );
	} else {
		return Site( site );
	}
};
/**
 * Marks collisions between .com sites and Jetpack sites that have the same URL
 * Add the hasConflict attribute to .com sites that collide with Jetpack sites.
 *
 * @api private
 *
 */
SitesList.prototype.markCollisions = function( sites ) {
	sites.forEach( function( site, index, collisions ) {
		var hasCollision;

		if ( ! site.jetpack ) {
			hasCollision = some( collisions, function( someSite ) {
				return ( someSite.jetpack && site.ID !== someSite.ID && withoutHttp( site.URL ) === withoutHttp( someSite.URL ) );
			} );
			if ( hasCollision ) {
				site.hasConflict = true;
			}
		}
	} );
};

/**
 * Parse data return from the API
 *
 * @param {array} data
 * @return {array} sites
 **/
SitesList.prototype.parse = function( data ) {
	/**
	 * Set primary flag for primary blog
	 */
	if ( typeof data.sites[ 0 ] !== 'undefined' ) {
		data.sites[ 0 ].primary = true;
	}

	return data.sites;
};

/**
 * Merge changes to existing sites and remove any sites that are not present
 **/
SitesList.prototype.update = function( sites ) {
	var sitesMap = {},
		changed = false;

	// Create ID -> site map from existing data
	this.data.forEach( function( site ) {
		sitesMap[ site.ID ] = site;
	} );

	this.markCollisions( sites );
	this.data = sites.map( function( site ) {
		var siteObj, result;

		if ( sitesMap[ site.ID ] ) {
			// Since updates are applied as a patch, ensure key is present for
			// properties which can be intentionally omitted from site payload.
			if ( ! site.hasOwnProperty( 'icon' ) ) {
				site.icon = undefined;
			}

			// Update existing Site object
			siteObj = sitesMap[ site.ID ];

			//Assign old URL because new url is broken because the site response caches domains
			//and we have trouble getting over it.
			if ( site.options.is_automated_transfer && site.URL.match( '.wordpress.com' ) ) {
				return siteObj;
			}

			// When we set a new front page, we clear out SitesList. On accounts with a large
			// number of sites, the resulting fetch can take time resulting in incorrect data
			// being displayed. This uses the correct siteObj as the source of truth in case
			// of a mismatch. See #13143.
			if ( siteObj.options.page_on_front !== site.options.page_on_front ) {
				return siteObj;
			}

			if ( site.options.is_automated_transfer && ! siteObj.jetpack && site.jetpack ) {
				//We have a site that was not jetpack and now is.
				siteObj.off( 'change', this.propagateChange );
				siteObj = this.createSiteObject( site );
				siteObj.on( 'change', this.propagateChange );
				changed = true;
			} else {
				result = siteObj.set( site );
			}

			if ( result ) {
				changed = true;
			}
			delete sitesMap[ site.ID ];
		} else {
			// Create new Site object
			siteObj = this.createSiteObject( site );
			siteObj.on( 'change', this.propagateChange );
			changed = true;
		}

		return siteObj;
	}, this );

	// For any sites that were removed during update, unbind events
	for ( var id in sitesMap ) {
		sitesMap[ id ].off( 'change', this.propagateChange );
		changed = true;
	}

	return changed;
};

/**
 * Updates the `plan` property of existing sites.
 *
 * @param {array} purchases - Array of purchases indexed by site IDs
 */
SitesList.prototype.updatePlans = function( purchases ) {
	if ( this.data ) {
		this.data = this.data.map( function( site ) {
			var plan;

			if ( purchases[ site.ID ] ) {
				plan = find( purchases[ site.ID ], isPlan );

				if ( plan ) {
					site.set( { plan: plan } );
				}
			}

			return site;
		} );
	}
};

/**
 * Suppress the propagation of events from models while performing
 * an operation.
 *
 * @api public
 * @callback {function} callback
 * @param {...*} args - arguments passed to the callback
 **/
SitesList.prototype.transaction = function() {
	var args = Array.prototype.slice.call( arguments ),
		callback = args.shift(),
		result;

	this.suppressPropagation = true;
	result = callback.apply( this, args );
	this.suppressPropagation = false;
	return result;
};

/**
 * Event handler used to propagate change events from Site models
 * to the SitesList. Use `this.trasaction` to suppress this behavior.
 **/
SitesList.prototype.propagateChange = function() {
	if ( ! this.suppressPropagation ) {
		debug( 'Propagating change event' );
		this.allSingleSites = ! find( this.data, function( site ) {
			return ! site.single_user_site;
		} );
		this.emit( 'change' );
	}
};

/**
 * Return the list of virtual sites of a multisite
 *
 * @api public
 */
SitesList.prototype.getNetworkSites = function( multisite ) {
	return this.get().filter( function( site ) {
		return site.jetpack &&
			site.visible &&
			( this.isConnectedSecondaryNetworkSite( site ) || site.isMainNetworkSite() ) &&
			multisite.options.unmapped_url === site.options.main_network_site;
	}, this );
};

SitesList.prototype.isConnectedSecondaryNetworkSite = function( siteCandidate ) {
	let isConnected = false,
		sites = this.get();

	if ( siteCandidate.jetpack && siteCandidate.isSecondaryNetworkSite() ) {
		sites.forEach( function( site ) {
			if ( siteCandidate.options.main_network_site === site.options.unmapped_url ) {
				isConnected = true;
			}
		} );
	}

	return isConnected;
};

/**
 * Return currently selected sites or site
 *
 * @api public
 */
SitesList.prototype.getSelectedOrAll = function() {
	if ( ! this.selected ) {
		return this.get();
	}

	return [ this.getSite( this.selected ) ];
};

/**
 * Return currently selected sites or false
 *
 * @api public
 */
SitesList.prototype.getSelectedSite = function() {
	return this.getSite( this.selected );
};

/**
 * Set selected site
 *
 * @param {number} Site ID
 * @api private
 */
SitesList.prototype.setSelectedSite = function( siteID ) {
	if ( ! siteID ) {
		return;
	}

	this.selected = siteID;
	this.emit( 'change' );
};

/**
 * Is the site selected
 *
 * @api public
 */
SitesList.prototype.isSelected = function( site ) {
	return this.selected === site.slug;
};

/**
 * Get a single site object from a numeric ID or domain ID
 *
 * @api public
 */
SitesList.prototype.getSite = function( siteID ) {
	if ( ! siteID ) {
		return false;
	}

	return find( this.get(), function( site ) {
		// We need to check `slug` before `domain` to grab the correct site on certain
		// clashes between a domain redirect and a Jetpack site, as well as domains
		// on subfolders, but we also need to look for the `domain` as a last resort
		// to cover mapped domains for regular WP.com sites.
		return site.ID === siteID || site.slug === siteID || site.domain === siteID || site.wpcom_url === siteID;
	} );
};

/**
 * Get primary site
 *
 * @api public
 **/
SitesList.prototype.getPrimary = function() {
	return find( this.get(), 'primary' );
};

/**
 * Set site visibility to a single site
 *
 * @api public
 * @return (bool) Whether there's a valid site object or not
 */
SitesList.prototype.select = function( siteID ) {
	// Attempt to grab a site object from the passed ID
	var site = this.getSite( siteID );

	/**
	 * If there's a valid site, hide all sites
	 * and set visibility to this site only
	 *
	 * Return true if there's a valid site object
	 */
	if ( site ) {
		this.setSelectedSite( site.slug );
		return true;
	/**
	 * If there's no valid site object return false
	 */
	} else {
		return false;
	}
};

SitesList.prototype.selectAll = function() {
	// If visibility is already set to all, avoid triggering a change event
	if ( this.selected ) {
		this.selected = null;
		this.emit( 'change' );
	}
};

SitesList.prototype.getJetpack = function() {
	return this.get().filter( function( site ) {
		return site.jetpack;
	}, this );
};

SitesList.prototype.getPublic = function() {
	return this.get().filter( function( site ) {
		return ! site.is_private;
	}, this );
};

/**
 * Get sites that are marked as visible
 *
 * @api public
 **/
SitesList.prototype.getVisible = function() {
	return this.get().filter( function( site ) {
		return site.visible === true;
	}, this );
};

SitesList.prototype.getUpgradeable = function() {
	return this.get().filter( function( site ) {
		return site.isUpgradeable();
	}, this );
};

SitesList.prototype.getSelectedOrAllJetpackCanManage = function() {
	return this.getSelectedOrAll().filter( function( site ) {
		return site.jetpack &&
			site.capabilities &&
			site.capabilities.manage_options &&
			site.canManage();
	} );
};

SitesList.prototype.getSelectedOrAllWithPlugins = function() {
	return this.getSelectedOrAll().filter( site => {
		return site.capabilities &&
			site.capabilities.manage_options &&
			site.jetpack &&
			( site.visible || this.selected );
	} );
};

SitesList.prototype.hasSiteWithPlugins = function() {
	return ! isEmpty( this.getSelectedOrAllWithPlugins() );
};

SitesList.prototype.removeSite = function( site ) {
	var sites, changed;
	if ( this.isSelected( site ) ) {
		this.selectAll();
	}
	sites = this.get().filter( function( _site ) {
		return _site.ID !== site.ID;
	} );

	changed = this.transaction( this.update, sites );

	if ( changed ) {
		this.emit( 'change' );
	}
};

/**
 * Update site instance inside Sites
 * @param  {[type]} site site instance
 */
SitesList.prototype.updateSite = function( updatedSite ) {
	var updatedSites = this.get().map( function( site ) {
		if ( updatedSite.ID !== site.ID ) {
			return site;
		}
		return updatedSite;
	} );
	if ( ! updatedSites.length ) {
		updatedSites = [ updatedSite ];
	}
	this.data = updatedSites;
};

/**
 * Whether the list sites has the ability to updates files
 * @return bool
 */
SitesList.prototype.canUpdateFiles = function() {
	var allowUpdate = false;

	this.getSelectedOrAll().forEach( function( site ) {
		if ( site.canUpdateFiles ) {
			allowUpdate = true;
			return;
		}
	} );
	return allowUpdate;
};

/**
 * Whether the user has a site that is selected or listed the user can manage
 * @return bool
 */
SitesList.prototype.canManageSelectedOrAll = function() {
	return this.getSelectedOrAll().some( function( site ) {
		if ( site.capabilities && site.capabilities.manage_options ) {
			return true;
		} else {
			return false;
		}
	} );
};

SitesList.prototype.onUpdatedPlugin = function( site ) {
	if ( ! site.jetpack ) {
		return;
	}
	site = this.getSite( site.slug );

	if ( site.updates && site.updates.plugins ) {
		let siteUpdateInfo = assign( {}, site.updates );
		siteUpdateInfo.plugins--;
		siteUpdateInfo.total--;
		site.set( { updates: siteUpdateInfo } );
	}
};

module.exports = SitesList;
