/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:sharing-buttons-list' ),
	uniqBy = require( 'lodash/uniqBy' ),
	orderBy = require( 'lodash/orderBy' ),
	findIndex = require( 'lodash/findIndex' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );

/**
 * SharingButtonsList component
 *
 * @api public
 */
function SharingButtonsList() {
	if ( ! ( this instanceof SharingButtonsList ) ) {
		return new SharingButtonsList();
	}
}

/**
 * Mixins
 */
Emitter( SharingButtonsList.prototype );

/**
 * Get list of sharing buttons from current object or, if this is the first
 * request for the specified site, fetch sharing buttons from REST API
 *
 * @param {int} siteId The site from which to retrieve sharing buttons
 */
SharingButtonsList.prototype.get = function( siteId ) {
	if ( ! this.data || this.siteId !== siteId ) {
		this.fetch( siteId );
		return [];
	}

	return this.data;
};

/**
 * Fetch sharing buttons from WordPress.com via the REST API.
 *
 * @api public
 */
SharingButtonsList.prototype.fetch = function( siteId ) {
	if ( ! this.fetching ) {
		this.fetching = true;

		debug( 'getting SharingButtonsList from api' );
		wpcom.undocumented().sharingButtons( siteId, function( error, data ) {
			if ( error ) {
				debug( 'error fetching SharingButtonsList from api', error );
				return;
			}

			this.siteId = siteId;
			this.data = data.sharing_buttons;
			this.emit( 'change' );
			this.fetching = false;
		}.bind( this ) );
	}
};

/**
 * Sends a network request to update buttons for a specified site.
 *
 * @param {int}          siteId   The site to which the buttons are to be saved
 * @param {Array|Object} buttons  A button object or array of button objects
 * @param {Function}     callback A callback to invoke when saving is complete
 */
SharingButtonsList.prototype.save = function( siteId, buttons, callback ) {
	var remainingToBeSaved;

	if ( this.saving ) {
		return;
	}
	this.saving = true;

	// Normalize buttons to array
	if ( ! Array.isArray( buttons ) ) {
		buttons = [ buttons ];
	}

	remainingToBeSaved = buttons.length;
	debug( 'saving SharingButtonsList to api' );

	buttons.forEach( function( button ) {
		wpcom.undocumented().saveSharingButton( siteId, button, function( error, data ) {
			var existingButtonIndex;

			if ( error ) {
				debug( 'error saving SharingButtonsList to api', error );
				this.saving = false;
				callback( error );
				return;
			}

			// Replace existing button with updated data
			existingButtonIndex = findIndex( this.data, { ID: data.ID } );
			if ( -1 !== existingButtonIndex ) {
				this.data.splice( existingButtonIndex, 1, data );
			}

			// If no requests remain in the current set of changes, clean
			// up and trigger a change
			if ( ! --remainingToBeSaved ) {
				this.emit( 'change' );
				this.saving = false;
				callback( null );
			}
		}.bind( this ) );
	}, this );
};

/**
 * Sends a network request to update all buttons for a specified site.
 *
 * @param {int}          siteId   The site to which the buttons are to be saved
 * @param {Array|Object} buttons  An array of button objects
 * @param {Function}     callback A callback to invoke when saving is complete
 */
SharingButtonsList.prototype.saveAll = function( siteId, buttons, callback ) {
	if ( this.saving || ! siteId || ! buttons ) {
		return;
	}
	this.saving = true;

	debug( 'saving SharingButtonsList to api' );
	wpcom.undocumented().saveSharingButtons( siteId, buttons, function( error, data ) {
		if ( error || ! data.updated ) {
			debug( 'error saving SharingButtonsList to api', error );
			this.saving = false;
			callback( error );
			return;
		}

		// 1. Original form response and current data
		//   - [ 1Y, 2N, 3Y ] [ 1N, 2Y, 3N, 4N, 5N ]
		// 2. Sort response data with enabled (Y) first
		//   - [ 1Y, 3Y, 2N ] [ 1N, 2Y, 3N, 4N, 5N ]
		// 3. Concatenate the two together
		//   - [ 1Y, 3Y, 2N, 1N, 2Y, 3N, 4N, 5N ]
		// 4. Only take the first value of each ID (#) encountered
		//   - [ 1Y, 3Y, 2N, 4N, 5N ]

		data.updated = orderBy( data.updated, 'enabled', 'desc' );
		this.data = uniqBy( data.updated.concat( this.data ), 'ID' );
		this.emit( 'change' );
		this.saving = false;
		callback( null );
	}.bind( this ) );
};

/**
 * Returns true if data has been retrieved for the specified site ID
 *
 * @param {int} siteId The site ID to check
 * @api public
 */
SharingButtonsList.prototype.hasDataForSiteId = function( siteId ) {
	return this.data && this.siteId === siteId;
};

/**
 * Expose `SharingButtonsList`
 */
module.exports = SharingButtonsList;
