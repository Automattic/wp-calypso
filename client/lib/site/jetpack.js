/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:site:jetpack' ),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Site = require( 'lib/site' ),
	inherits = require( 'inherits' ),
	notices = require( 'notices' ),
	versionCompare = require( 'lib/version-compare' ),
	SiteUtils = require( 'lib/site/utils' ),
	config = require( 'config' );

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
	this.hasJetpackMenus = versionCompare( this.options.jetpack_version, '3.5-alpha' ) >= 0;
	this.hasJetpackThemes = versionCompare( this.options.jetpack_version, '3.7-beta' ) >= 0;
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

JetpackSite.prototype.fetchAvailableUpdates = function() {
	if ( ! this.hasMinimumJetpackVersion ||
		! this.capabilities.manage_options ||
		! this.canUpdateFiles ) {
		return;
	}
	wpcom.undocumented().getAvailableUpdates( this.ID, function( error, data ) {
		if ( error ) {
			debug( 'error fetching Updates data from api', error );
			return;
		}
		this.set( { update: data } );
	}.bind( this ) );
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

JetpackSite.prototype.verifyModulesActive = function( moduleIds, callback ) {
	var modulesActive;

	if ( ! Array.isArray( moduleIds ) ) {
		moduleIds = [ moduleIds ];
	}

	modulesActive = moduleIds.every( function( moduleId ) {
		return this.isModuleActive( moduleId );
	}, this );

	callback( null, modulesActive );
};

JetpackSite.prototype.getRemoteManagementURL = function() {
	var configure = versionCompare( this.options.jetpack_version, 3.4 ) ? 'manage' : 'json-api';
	return this.options.admin_url + 'admin.php?page=jetpack&configure=' + configure;
};

JetpackSite.prototype.handleError = function( error, action, plugin, module ) {
	var moduleTranslationArgs = {},
		buttonRemoteManagement,
		remoteManagementUrl;

	if ( ! error.error ) {
		return;
	}

	if ( module ) {
		moduleTranslationArgs = { args: { module: module, site: this.domain } };
	}

	remoteManagementUrl = this.getRemoteManagementURL();

	buttonRemoteManagement = {
		button: i18n.translate( 'Turn On.' ),
		href: remoteManagementUrl
	};

	if ( 'activateModule' === action ) {
		switch ( error.error ) {
			case 'unauthorized_full_access':
				notices.error(
					i18n.translate(
						'Error activating the Jetpack %(module)s feature on %(site)s, remote management is off.',
						moduleTranslationArgs
					),
					buttonRemoteManagement
				);
				break;
			default:
				notices.error(
					i18n.translate(
						'An error occurred while activating the Jetpack %(module)s feature on %(site)s.',
						moduleTranslationArgs
					)
				);
				break;
		}
	}

	if ( 'deactivateModule' === action ) {
		switch ( error.error ) {
			case 'unauthorized_full_access':
				notices.error(
					i18n.translate(
						'Error deactivating the Jetpack %(module)s feature on %(site)s, remote management is off.',
						moduleTranslationArgs
					),
					buttonRemoteManagement
				);
				break;
			default:
				notices.error(
					i18n.translate(
						'An error occurred while deactivating the Jetpack %(module)s feature on %(site)s.',
						moduleTranslationArgs
					)
				);
				break;
		}
	}
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
		this.update.wordpress--;
		this.update.total--;

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

JetpackSite.prototype.activateModule = function( moduleId, callback ) {
	debug( 'activate module', moduleId );

	if ( ! moduleId ) {
		callback && callback( new Error( 'No id' ) );
		return;
	}

	if ( this.isModuleActive( moduleId ) ) {
		// Nothing to do
		callback();
		return;
	}

	this.toggleModule( moduleId, callback );
};

JetpackSite.prototype.deactivateModule = function( moduleId, callback ) {
	debug( 'deactivate module', moduleId );

	if ( ! this.isModuleActive( moduleId ) ) {
		// Nothing to do
		callback();
		return;
	}

	this.toggleModule( moduleId, callback );
};

JetpackSite.prototype.toggleModule = function( moduleId, callback ) {
	const isActive = this.isModuleActive( moduleId ),
		method = isActive ? 'jetpackModulesDeactivate' : 'jetpackModulesActivate',
		prevActiveModules = [ ...this.modules ];

	if ( isActive ) {
		this.modules = this.modules.filter( module => module !== moduleId );
	} else {
		this.modules = [ ...this.modules, moduleId ];
	}
	wpcom.undocumented()[ method ]( this.ID, moduleId, function( error, data ) {
		debug( 'module toggled', this.URL, moduleId, data );

		if ( error ) {
			debug( 'error toggling module from api', error );
			this.modules = prevActiveModules;
			this.emit( 'change' );
		}
		callback && callback( error, data );
	}.bind( this ) );

	this.emit( 'change' );
};

JetpackSite.prototype.fetchMonitorSettings = function( callback ) {
	if ( this.monitorSettings ) {
		callback && callback( this.monitorSettings.error, this.monitorSettings.data );
	}

	if ( ! this.fetchingMonitorSettings ) {
		this.set( { fetchingMonitorSettings: true } );
		wpcom.undocumented().fetchMonitorSettings( this.ID, function( error, data ) {
			this.set( {
				fetchingMonitorSettings: false,
				monitorSettings: {
					error: error,
					data: data
				}
			} );
			if ( error ) {
				debug( 'error fetching Jetpack Monitor settings', error );
				callback && callback( error );
				return;
			}
			debug( 'retrieved Monitor settings', data );
			callback && callback( null, data );
		}.bind( this ) );
		this.emit( 'change' );
	}
};

JetpackSite.prototype.updateMonitorSettings = function( emailNotifications, callback ) {
	wpcom.undocumented().updateMonitorSettings( this.ID, emailNotifications, function( error, data ) {
		if ( error ) {
			debug( 'error updating Jetpack Monitor settings', error );
			callback && callback( error );
			return;
		}
		this.set( {
			monitorSettings: false,
			fetchingMonitorSettings: false
		} );
		callback && callback( null, data );
	}.bind( this ) );
};

JetpackSite.prototype.toggleSshScan = function( query, callback ) {
	wpcom.undocumented().site( this.ID ).sshScanToggle( query, function( error, data ) {
		this.emit( 'change' );

		if ( error ) {
			debug( 'error toggling SSH scan', error );
			callback && callback( error );
			return;
		}

		debug( 'toggled SSH scan', data );

		callback && callback( null, data );
	}.bind( this ) );

	this.emit( 'change' );
};

JetpackSite.prototype.fetchSshCredentials = function( callback ) {
	wpcom.undocumented().site( this.ID ).sshCredentialsMine( {}, function( error, data ) {
		this.emit( 'change' );

		if ( error ) {
			debug( 'error fetching SSH from api', error );
			callback && callback( error );
			return;
		}

		debug( 'retrieved SSH credentials', data );

		callback && callback( null, data );
	}.bind( this ) );

	this.emit( 'change' );
};

JetpackSite.prototype.updateSshCredentials = function( query, callback ) {
	wpcom.undocumented().site( this.ID ).sshCredentialsNew( query, function( error, data ) {
		this.emit( 'change' );

		if ( error ) {
			debug( 'error updating SSH credentials', error );
			callback && callback( error );
			return;
		}

		debug( 'updated SSH credentials', data );

		callback && callback( null, data );
	}.bind( this ) );

	this.emit( 'change' );
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

JetpackSite.prototype.fetchJetpackKeys = function( callback ) {
	wpcom.undocumented().fetchJetpackKeys( this.ID, function( error, data ) {
		if ( error ) {
			debug( 'error getting Jetpack registration keys', error );
		}
		callback && callback( error, data );
	}.bind( this ) );
};

module.exports = JetpackSite;
