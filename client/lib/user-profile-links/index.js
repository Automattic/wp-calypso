/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:user:profile-links' ),
	reject = require( 'lodash/reject' ),
	some = require( 'lodash/some' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	emitter = require( 'lib/mixins/emitter' );

/*
 * Initialize UserProfileLinks with defaults
 */
function UserProfileLinks() {
	if ( ! ( this instanceof UserProfileLinks ) ) {
		return new UserProfileLinks();
	}

	this.profileLinks = false;
	this.initialized = false;
	this.reAuthRequired = false;
	this.fetchingProfileLinks = false;
}

emitter( UserProfileLinks.prototype );

/*
 * Returns a boolean signifying whether there are profile links or not
 */
UserProfileLinks.prototype.hasProfileLinks = function() {
	return !! this.profileLinks;
};

/*
 * Returns a boolean signifying whether the given site is already in the profile links
 */
UserProfileLinks.prototype.isSiteInProfileLinks = function( site ) {
	if ( ! this.initialized ) {
		return false;
	}

	return some( this.profileLinks, function( profileLink ) {
		// the regex below is used to strip any leading scheme from the profileLink's URL
		return ( site.domain === profileLink.value.replace( /^.*:\/\//, '' ) );
	} );
};

/*
 * Get user profile links. If not already initialized, then fetch them
 */
UserProfileLinks.prototype.getProfileLinks = function() {
	if ( ! this.profileLinks ) {
		this.fetchProfileLinks();
	}

	return this.profileLinks;
};

/**
 * Fetch user profile links from WordPress.com API and store them in UserProfileLinks instance
 */
UserProfileLinks.prototype.fetchProfileLinks = function() {
	if ( this.fetchingProfileLinks || this.reAuthRequired ) {
		return;
	}

	this.fetchingProfileLinks = true;
	debug( 'Fetching profile links for user' );
	wpcom
	.me()
	.settings()
	.profileLinks()
	.get( function( error, data ) {
		this.fetchingProfileLinks = false;
		if ( error ) {
			debug( 'Something went wrong fetching the profile links for the user.' );
			if ( ( 'error' in error ) && ( 'reauthorization_required' === error.error ) ) {
				this.reAuthRequired = true;
			}
			this.emit( 'change' );
			return;
		}
		this.profileLinks = data.profile_links;
		this.initialized = true;
		this.emit( 'change' );

		debug( 'Profile links successfully retrieved' );
	}.bind( this ) );
};

/*
 * Add a profile link by using the WordPress.com /me/settings/profile-links/new 1.2 endpoint
 */
UserProfileLinks.prototype.addProfileLinks = function( profileLinks, callback ) {
	wpcom
	.me()
	.settings()
	.profileLinks()
	.add( profileLinks, function( error, data ) {
		if ( data && data.profile_links ) {
			this.profileLinks = data.profile_links;
			this.emit( 'change' );
		}
		// Let the form know whether the save was completely successful or not
		callback( error, data );
	}.bind( this ) );
};

/*
 * Delete a profile link by using the WordPress.com /me/settings/profile-links/%s/delete endpoint
 */
UserProfileLinks.prototype.deleteProfileLinkBySlug = function( slug, callback ) {
	wpcom
	.me()
	.settings()
	.profileLinks()
	.del( slug, function( error, data ) {
		if ( ! error ) {
			this.profileLinks = reject( this.profileLinks, { link_slug: slug } );
			this.emit( 'change' );
		}

		// Let the form know whether the deletion was successful or not
		callback( error, data );
	}.bind( this ) );
};

/*
 * Expose UserProfileLinks
 */
module.exports = new UserProfileLinks();
