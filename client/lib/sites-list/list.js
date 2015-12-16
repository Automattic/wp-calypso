/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:sites-list' ),
	store = require( 'store' ),
	assign = require( 'lodash/object/assign' ),
	find = require( 'lodash/collection/find' ),
	some = require( 'lodash/collection/some' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Site = require( 'lib/site' ),
	JetpackSite = require( 'lib/site/jetpack' ),
	Searchable = require( 'lib/mixins/searchable' ),
	Emitter = require( 'lib/mixins/emitter' ),
	isBusiness = require( 'lib/products-values' ).isBusiness,
	user = require( 'lib/user' )();

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
	this.lastSelected = null;
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
	var currentUser = user.get(),
		siteVisiblity = 'all';

	if ( this.fetching ) {
		return;
	}

	// If the user has too many sites the endpoint fails to resolve
	if ( currentUser && currentUser.site_count > 300 ) {
		siteVisiblity = 'visible';
	}

	this.fetching = true;
	debug( 'getting SitesList from api' );
	wpcom.me().sites( { site_visibility: siteVisiblity }, function( error, data ) {
		var sites, changed;

		if ( error ) {
			debug( 'error fetching SitesList from api', error );
			this.fetching = false;
			return;
		}

		debug( 'SitesList fetched from api:', data.sites );

		sites = this.parse( data );

		if ( ! this.initialized ) {
			this.initialize( sites );
			this.fetched = true;
			this.emit( 'change' );
		} else {
			changed = this.transaction( this.update, sites );
			if ( changed || ! this.fetched ) {
				this.fetched = true;
				debug( 'SitesList changed via update' );
				this.emit( 'change' );
			}
		}
		this.fetching = false;
		store.set( 'SitesList', sites );
	}.bind( this ) );
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
				return ( someSite.jetpack && site.ID !== someSite.ID && site.URL === someSite.URL );
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
		changed = false,
		oldSelected = this.getSelectedSite();

	// Create ID -> site map from existing data
	this.data.forEach( function( site ) {
		sitesMap[ site.ID ] = site;
	} );

	this.markCollisions( sites );
	this.data = sites.map( function( site ) {
		var siteObj, result;

		if ( sitesMap[ site.ID ] ) {
			// Update existing Site object
			siteObj = sitesMap[ site.ID ];
			result = siteObj.set( site );
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
 * Return the last selected site or false
 *
 * @api public
 */
SitesList.prototype.getLastSelectedSite = function() {
	return this.getSite( this.lastSelected );
};

/**
 * Resets the selected site
 *
 * @api public
 */
SitesList.prototype.resetSelectedSite = function() {
	if ( ! this.selected ) {
		return;
	}

	this.lastSelected = this.selected;
	this.selected = null;
	this.emit( 'change' );
};

/**
 * Set selected site
 *
 * @param {number} Site ID to update visibility state
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

	return this.get().filter( function( site ) {
		// We need to check `slug` before `domain` to grab the correct site on certain
		// clashes between a domain redirect and a Jetpack site, as well as domains
		// on subfolders, but we also need to look for the `domain` as a last resort
		// to cover mapped domains for regular WP.com sites.
		return site.ID === siteID || site.slug === siteID || site.domain === siteID || site.wpcom_url === siteID;
	}, this ).shift();
};

/**
 * Get primary site
 *
 * @api public
 **/
SitesList.prototype.getPrimary = function() {
	return this.get().filter( function( site ) {
		return site.primary === true;
	}, this ).shift();
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
	return this.getSelectedOrAll().concat(
		this.getSelectedOrAll().filter( function( site ) {
			return isBusiness( site.plan );
		} )
	);
};

SitesList.prototype.hasSiteWithPlugins = function() {
	return some( this.get(), function( site ) {
		return isBusiness( site.plan ) || site.jetpack;
	} );
};

SitesList.prototype.fetchAvailableUpdates = function() {
	this.getJetpack().forEach( function( site ) {
		site.fetchAvailableUpdates();
	}, this );
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
/**
 * Whether the user has any jetpack site that the user can manage
 * @return bool
 */
SitesList.prototype.canManageAnyJetpack = function() {
	return this.getJetpack().some( function( site ) {
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

	if ( site.update && site.update.plugins ) {
		let siteUpdateInfo = assign( {}, site.update );
		siteUpdateInfo.plugins--;
		siteUpdateInfo.total--;
		site.set( { update: siteUpdateInfo } );

		if ( site.update.plugins <= 0 ) {
			site.fetchAvailableUpdates();
		}
	}
};

module.exports = SitesList;
