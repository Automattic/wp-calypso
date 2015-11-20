/**
 * External dependencies
 */
var React = require( 'react' ),
	groupBy = require( 'lodash/collection/groupBy' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	NoticeArrowAction = require( 'notices/arrow-link' ),
	PluginsLog = require( 'lib/plugins/log-store' ),
	PluginsActions = require( 'lib/plugins/actions' ),
	PluginsUtil = require( 'lib/plugins/utils' ),
	versionCompare = require( 'lib/version-compare' ),
	i18n = require( 'lib/mixins/i18n' );

function getCombination( translateArg ) {
	return ( translateArg.numberOfSites > 1 ? 'n sites' : '1 site' ) + ' ' + ( translateArg.numberOfPlugins > 1 ? 'n plugins' : '1 plugin' );
}

function getTranslateArg( logs, sampleLog ) {
	var groupedBySite,
		groupedByPlugin;

	groupedBySite = groupBy( logs, function( log ) {
		return log.site.ID && log.type === sampleLog.type;
	} );

	groupedByPlugin = groupBy( logs, function( log ) {
		return log.plugin.slug && log.type === sampleLog.type;
	} );

	return {
		plugin: sampleLog.plugin.name,
		wp_admin_settings_page_url: sampleLog.plugin.wp_admin_settings_page_url,
		numberOfPlugins: Object.keys( groupedByPlugin ).length,
		site: sampleLog.site.title,
		isMultiSite: sampleLog.site.is_multi_site,
		numberOfSites: Object.keys( groupedBySite ).length
	};
}

module.exports = {
	getInitialState: function() {
		return { notices: this.refreshPluginNotices() };
	},
	componentDidMount: function() {
		PluginsLog.on( 'change', this.showNotification );
	},

	componentWillUnmount: function() {
		PluginsLog.removeListener( 'change', this.showNotification );
	},

	refreshPluginNotices: function() {
		var site = this.props.sites.getSelectedSite();
		return {
			errors: PluginsUtil.filterNotices( PluginsLog.getErrors(), site, this.props.pluginSlug ),
			inProgress: PluginsUtil.filterNotices( PluginsLog.getInProgress(), site, this.props.pluginSlug ),
			completed: PluginsUtil.filterNotices( PluginsLog.getCompleted(), site, this.props.pluginSlug )
		};
	},

	showNotification: function() {
		var logNotices = this.refreshPluginNotices();
		this.setState( { notices: logNotices } );
		if ( logNotices.inProgress.length > 0 ) {
			notices.info( this.getMessage( logNotices.inProgress, this.inProgressMessage ) );
			return;
		}

		if ( logNotices.completed.length > 0 && logNotices.errors.length > 0 ) {
			notices.warning( this.erroredAndCompletedMessage( logNotices ), {
				onRemoveCallback: PluginsActions.removePluginsNotices.bind( this, logNotices.completed.concat( logNotices.errors ) )
			} );
		} else if ( logNotices.errors.length > 0 ) {
			notices.error( this.getMessage( logNotices.errors, this.errorMessage ), {
				button: this.getErrorButton( logNotices.errors ),
				href: this.getErrorHref( logNotices.errors ),
				onRemoveCallback: PluginsActions.removePluginsNotices.bind( this, logNotices.errors )
			} );
		} else if ( logNotices.completed.length > 0 ) {
			const sampleLog = logNotices.completed[ 0 ].status === 'inProgress' ?
				logNotices.completed[ 0 ] :
				logNotices.completed[ logNotices.completed.length - 1 ],
				// the dismiss button would overlap the link to the settings page when activating
				showDismiss = ! ( sampleLog.plugin.wp_admin_settings_page_url && 'ACTIVATE_PLUGIN' === sampleLog.action );

			notices.success( this.getMessage( logNotices.completed, this.successMessage ), {
				onRemoveCallback: PluginsActions.removePluginsNotices.bind( this, logNotices.completed ),
				showDismiss
			} );
		}
	},

	getMessage: function( logs, messageFunction ) {
		var sampleLog, combination, translateArg;
		sampleLog = ( logs[ 0 ].status === 'inProgress' ? logs[ 0 ] : logs[ logs.length - 1 ] );
		translateArg = getTranslateArg( logs, sampleLog );
		combination = getCombination( translateArg );
		return messageFunction( sampleLog.action, combination, translateArg, sampleLog );
	},

	successMessage: function( action, combination, translateArg ) {
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				if ( translateArg.isMultiSite ) {
					switch ( combination ) {
						case '1 site 1 plugin':
							return i18n.translate( 'Successfully installed %(plugin)s on %(site)s.', { args: translateArg } );
						case '1 site n plugins':
							return i18n.translate( 'Successfully installed %(numberOfPlugins)d plugins on %(site)s.', {
								args: translateArg
							} );
						case 'n sites 1 plugin':
							return i18n.translate( 'Successfully installed %(plugin)s on %(numberOfSites)d sites.', {
								args: translateArg
							} );
						case 'n sites n plugins':
							return i18n.translate( 'Successfully installed %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
								args: translateArg
							} );
					}
				}
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Successfully installed and activated %(plugin)s on %(site)s.', {
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Successfully installed and activated %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully installed and activated %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Successfully installed and activated %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}

				break;
			case 'REMOVE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Successfully removed %(plugin)s on %(site)s.', { args: translateArg } );
					case '1 site n plugins':
						return i18n.translate( 'Successfully removed %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully removed %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Successfully removed %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'UPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Successfully updated %(plugin)s on %(site)s.', { args: translateArg } );
					case '1 site n plugins':
						return i18n.translate( 'Successfully updated %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully updated %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Successfully updated %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'ACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						if ( translateArg.wp_admin_settings_page_url ) {
							return i18n.translate( 'Successfully activated %(plugin)s on %(site)s. ' +
									'{{action}}Setup{{/action}}', {
										args: translateArg,
										components: {
											action: <NoticeArrowAction
												href={ translateArg.wp_admin_settings_page_url }
												target="_blank" />
										},
										context: 'Success message when activating a plugin with a link to the plugin settings.'
									} );
						}
						return i18n.translate( 'Successfully activated %(plugin)s on %(site)s.', { args: translateArg } );
					case '1 site n plugins':
						return i18n.translate( 'Successfully activated %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully activated %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Successfully activated %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'DEACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Successfully deactivated %(plugin)s on %(site)s.', { args: translateArg } );
					case '1 site n plugins':
						return i18n.translate( 'Successfully deactivated %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully deactivated %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Successfully deactivated %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Successfully enabled autoupdates for %(plugin)s on %(site)s.', {
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Successfully enabled autoupdates for %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully enabled autoupdates for %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Successfully enabled autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Successfully disabled autoupdates for %(plugin)s on %(site)s.', {
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Successfully disabled autoupdates for %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully disabled autoupdates for %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Successfully disabled autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
		}
	},

	inProgressMessage: function( action, combination, translateArg ) {
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Installing %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Installing %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Installing %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Installing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
				}
				break;
			case 'REMOVE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Removing %(plugin)s on %(site)s.', { args: translateArg } );
					case '1 site n plugins':
						return i18n.translate( 'Removing %(numberOfPlugins)d plugins on %(site)s.', { args: translateArg } );
					case 'n sites 1 plugin':
						return i18n.translate( 'Removing %(plugin)s on %(numberOfSites)d sites.', { args: translateArg } );
					case 'n sites n plugins':
						return i18n.translate( 'Removing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'UPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Updating %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Updating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Updating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Updating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
				}
				break;
			case 'ACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Activating %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Activating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Activating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Activating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
				}
				break;
			case 'DEACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Deactivating %(plugin)s on %(site)s', {
							context: 'In progress message',
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Deactivating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Deactivating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Deactivating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
				}
				break;
			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Enabling autoupdates for %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Enabling autoupdates for %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Enabling autoupdates for %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Enabling autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
				}
				break;
			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Disabling autoupdates for %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case '1 site n plugins':
						return i18n.translate( 'Disabling autoupdates for %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Disabling autoupdates for %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'Disabling autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg
						} );
				}
				break;
		}
	},

	erroredAndCompletedMessage: function( logNotices ) {
		var completedMessage = this.getMessage( logNotices.completed, this.successMessage ),
			errorMessage = this.getMessage( logNotices.errors, this.errorMessage );
		return ' ' + completedMessage + ' ' + errorMessage;
	},

	errorMessage: function( action, combination, translateArg, sampleLog ) {
		if ( combination === '1 site 1 plugin' ) {
			return this.singleErrorMessage( action, translateArg, sampleLog );
		}
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return i18n.translate( 'There were errors installing %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'There were errors installing %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'There were errors installing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'REMOVE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return i18n.translate( 'There were errors removing %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'There were errors removing %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'There were errors removing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'UPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return i18n.translate( 'There were errors updating %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'There were errors updating %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'There were errors updating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'ACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return i18n.translate( 'There were errors activating %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'There were errors activating %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'There were errors activating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'DEACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return i18n.translate( 'There were errors deactivating %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'There were errors deactivating %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'There were errors deactivating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return i18n.translate( 'There were errors enabling autoupdates %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'There were errors enabling autoupdates %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'There were errors enabling autoupdates %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return i18n.translate( 'There were errors disabling autoupdates %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'There were errors disabling autoupdates %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg
						} );
					case 'n sites n plugins':
						return i18n.translate( 'There were errors disabling autoupdates %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg
						} );
				}
				break;
		}
	},

	singleErrorMessage: function( action, translateArg, sampleLog ) {
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate( 'Error installing %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg
						} );
					default:
						return i18n.translate( 'An error occurred while installing %(plugin)s on %(site)s.', {
							args: translateArg
						} );
				}
				break;
			case 'REMOVE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate( 'Error removing %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg
						} );
					default:
						return i18n.translate( 'An error occurred while removing %(plugin)s on %(site)s.', { args: translateArg } );
				}
				break;
			case 'UPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate( 'Error updating %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg
						} );
					default:
						return i18n.translate( 'An error occurred while updating %(plugin)s on %(site)s.', { args: translateArg } );
				}
				break;
			case 'ACTIVATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate( 'Error activating %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg
						} );
					default:
						return i18n.translate( 'An error occurred while activating %(plugin)s on %(site)s.', {
							args: translateArg
						} );

				}
				break;
			case 'DEACTIVATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate( 'Error deactivating %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg
						} );
					default:
						return i18n.translate( 'An error occurred while deactivating %(plugin)s on %(site)s.', {
							args: translateArg
						} );
				}
				break;
			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate( 'Error enabling autoupdates for %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg
						} );
					default:
						return i18n.translate( 'An error occurred while enabling autoupdates for %(plugin)s on %(site)s.', {
							args: translateArg
						} );
				}
				break;
			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate( 'Error disabling autoupdates for %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg
						} );
					default:
						return i18n.translate( 'An error occurred while disabling autoupdates for %(plugin)s on %(site)s.', {
							args: translateArg
						} );
				}
				break;
		}
	},

	getErrorButton: function( log ) {
		if ( log.length > 1 ) {
			return null;
		}
		log = log.length ? log[ 0 ] : log;
		if ( log.error.error === 'unauthorized_full_access' ) {
			return i18n.translate( 'Turn On.' );
		}
		return null;
	},

	getErrorHref: function( log ) {
		var remoteManagementUrl;
		if ( log.length > 1 ) {
			return null;
		}
		log = log.length ? log[ 0 ] : log;
		if ( log.error.error !== 'unauthorized_full_access' ) {
			return null;
		}
		remoteManagementUrl = log.site.options.admin_url + 'admin.php?page=jetpack&configure=json-api';
		if ( versionCompare( log.site.options.jetpack_version, 3.4 ) >= 0 ) {
			remoteManagementUrl = log.site.options.admin_url + 'admin.php?page=jetpack&configure=manage';
		}
		return remoteManagementUrl;
	}
};
