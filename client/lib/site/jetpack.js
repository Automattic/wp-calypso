/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Site = require( 'lib/site' ),
	inherits = require( 'inherits' ),
	versionCompare = require( 'lib/version-compare' ),
	SiteUtils = require( 'lib/site/utils' ),
	config = require( 'config' );

inherits( JetpackSite, Site );

const debug = debugFactory( 'calypso:site:jetpack' );

function JetpackSite( attributes ) {
	if ( ! ( this instanceof JetpackSite ) ) {
		return new JetpackSite( attributes );
	}
	this.attributes( attributes );
}

JetpackSite.prototype.updateComputedAttributes = function() {
	JetpackSite.super_.prototype.updateComputedAttributes.apply( this );
	if ( this.jetpack_modules ) {
		this.modules = this.jetpack_modules;
		delete this.jetpack_modules;
	}
	this.hasMinimumJetpackVersion = versionCompare( this.options.jetpack_version, config( 'jetpack_min_version' ) ) >= 0;
	// Only sites that have the minimum Jetpack Version and siteurl matches the main_network_site can update plugins
	// unmapped_url is more likely to equal main_network_site because they should both be set to siteurl option
	// is_multi_network checks to see that a site is not part of a multi network
	// Since there is no primary network we disable updates for that case
	this.canUpdateFiles = SiteUtils.canUpdateFiles( this );
	this.canAutoupdateFiles = SiteUtils.canAutoupdateFiles( this );
};

JetpackSite.prototype.versionCompare = function( compare, operator ) {
	return versionCompare( this.options.jetpack_version, compare, operator );
};

// determines if site has opted in for full-site management
JetpackSite.prototype.canManage = function() {
	// for versions 3.4 and higher, canManage can be determined by the state of the Manage Module
	if ( this.versionCompare( '3.4', '>=' ) ) {
		// if we haven't fetched the modules yet, we default to true
		if ( this.modules ) {
			return this.isModuleActive( 'manage' );
		}
		return true;
	}
	// for version lower than 3.4, we cannot not determine canManage, we'll assume they can
	return true;
};

JetpackSite.prototype.isSecondaryNetworkSite = function() {
	return this.options.is_multi_site &&
		this.options.unmapped_url !== this.options.main_network_site;
};

JetpackSite.prototype.isMainNetworkSite = function() {
	return this.options.is_multi_site &&
		this.options.unmapped_url === this.options.main_network_site;
};

JetpackSite.prototype.isModuleActive = function( moduleId ) {
	return this.modules && this.modules.indexOf( moduleId ) > -1;
};

JetpackSite.prototype.getRemoteManagementURL = function() {
	var configure = versionCompare( this.options.jetpack_version, 3.4, '>=' ) ? 'manage' : 'json-api';
	return this.options.admin_url + 'admin.php?page=jetpack&configure=' + configure;
};

JetpackSite.prototype.updateWordPress = function( onError, onSuccess ) {
	this.updating = true;
	wpcom.undocumented().updateWordPressCore( this.ID, function( error, data ) {
		delete this.updating;

		if ( error ) {
			if ( onError ) {
				onError( error );
			}
			this.emit( 'change' );
			return;
		}

		if ( onSuccess ) {
			onSuccess( data );
		}

		// Decrease count
		this.updates.wordpress--;
		this.updates.total--;

		this.emit( 'change' );
	}.bind( this ) );
	this.emit( 'change' );
};

JetpackSite.prototype.callHome = function() {
	this.callingHome = true;
	// try to grab some posts since this feature should be available since Jetpack 1.9
	wpcom.undocumented().testConnectionJetpack( this.ID, function( error, data ) {
		if ( error ) {
			this.unreachable = true;
		} else {
			this.unreachable = ! data.connected;
		}
		this.callingHome = false;
		this.emit( 'change' );
	}.bind( this ) );
};

JetpackSite.prototype.getOption = function( query, callback ) {
	wpcom.undocumented().site( this.ID ).getOption( query, function( error, data ) {
		this.emit( 'change' );

		if ( error ) {
			debug( 'error getting option', error );
		}

		callback && callback( error, data );
	}.bind( this ) );

	this.emit( 'change' );
};

JetpackSite.prototype.setOption = function( query, callback ) {
	query.site_option = query.site_option || false;
	query.is_array = query.is_array || false;
	wpcom.undocumented().site( this.ID ).setOption( query, function( error, data ) {
		this.emit( 'change' );

		if ( error ) {
			debug( 'error getting option', error );
		}

		callback && callback( error, data );
	}.bind( this ) );

	this.emit( 'change' );
};

module.exports = JetpackSite;
