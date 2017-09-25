/**
 * External dependencies
 */
import inherits from 'inherits';

/**
 * Internal dependencies
 */
import config from 'config';
import Site from 'lib/site';
import SiteUtils from 'lib/site/utils';
import versionCompare from 'lib/version-compare';

inherits( JetpackSite, Site );

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
	const configure = versionCompare( this.options.jetpack_version, 3.4, '>=' ) ? 'manage' : 'json-api';
	return this.options.admin_url + 'admin.php?page=jetpack&configure=' + configure;
};

export default JetpackSite;
