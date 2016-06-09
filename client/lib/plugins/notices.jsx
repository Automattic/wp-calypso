/**
 * External dependencies
 */
import groupBy from 'lodash/groupBy';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'notices';
import PluginsLog from 'lib/plugins/log-store';
import PluginsActions from 'lib/plugins/actions';
import PluginsUtil from 'lib/plugins/utils';
import versionCompare from 'lib/version-compare';

function getCombination( translateArg ) {
	return ( translateArg.numberOfSites > 1 ? 'n sites' : '1 site' ) + ' ' + ( translateArg.numberOfPlugins > 1 ? 'n plugins' : '1 plugin' );
}

function getTranslateArg( logs, sampleLog, typeFilter ) {
	const filteredLogs = logs.filter( ( log ) => {
		return log.status === typeFilter ? typeFilter : sampleLog.type;
	} );

	const groupedBySite = groupBy( filteredLogs, ( log ) => {
		return log.site.ID;
	} );

	const groupedByPlugin = groupBy( filteredLogs, ( log ) => {
		return log.plugin.slug;
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
	shouldComponentUpdateNotices( currentNotices, nextNotices ) {
		if ( currentNotices.errors && currentNotices.errors.length !== nextNotices.errors.length ) {
			return true;
		}
		if ( currentNotices.inProgress && currentNotices.inProgress.length !== nextNotices.inProgress.length ) {
			return true;
		}
		if ( currentNotices.completed && currentNotices.completed.length !== nextNotices.completed.length ) {
			return true;
		}
		return false;
	},

	getInitialState() {
		return { notices: this.refreshPluginNotices() };
	},

	componentDidMount() {
		PluginsLog.on( 'change', this.showNotification );
	},

	componentWillUnmount() {
		PluginsLog.removeListener( 'change', this.showNotification );
	},

	refreshPluginNotices() {
		const site = this.props.sites.getSelectedSite();
		return {
			errors: PluginsUtil.filterNotices( PluginsLog.getErrors(), site, this.props.pluginSlug ),
			inProgress: PluginsUtil.filterNotices( PluginsLog.getInProgress(), site, this.props.pluginSlug ),
			completed: PluginsUtil.filterNotices( PluginsLog.getCompleted(), site, this.props.pluginSlug )
		};
	},

	showNotification() {
		const logNotices = this.refreshPluginNotices();
		this.setState( { notices: logNotices } );
		if ( logNotices.inProgress.length > 0 ) {
			notices.info( this.getMessage( logNotices.inProgress, this.inProgressMessage, 'inProgress' ) );
			return;
		}

		if ( logNotices.completed.length > 0 && logNotices.errors.length > 0 ) {
			notices.warning( this.erroredAndCompletedMessage( logNotices ), {
				onRemoveCallback: PluginsActions.removePluginsNotices.bind( this, logNotices.completed.concat( logNotices.errors ) )
			} );
		} else if ( logNotices.errors.length > 0 ) {
			notices.error( this.getMessage( logNotices.errors, this.errorMessage, 'errors' ), {
				button: this.getErrorButton( logNotices.errors ),
				href: this.getErrorHref( logNotices.errors ),
				onRemoveCallback: PluginsActions.removePluginsNotices.bind( this, logNotices.errors )
			} );
		} else if ( logNotices.completed.length > 0 ) {
			const sampleLog = logNotices.completed[ 0 ].status === 'inProgress'
				? logNotices.completed[ 0 ]
				: logNotices.completed[ logNotices.completed.length - 1 ],
				// the dismiss button would overlap the link to the settings page when activating
				showDismiss = ! ( sampleLog.plugin.wp_admin_settings_page_url && 'ACTIVATE_PLUGIN' === sampleLog.action );

			notices.success( this.getMessage( logNotices.completed, this.successMessage, 'completed' ), {
				button: this.getSuccessButton( logNotices.completed ),
				href: this.getSuccessHref( logNotices.completed ),
				onRemoveCallback: PluginsActions.removePluginsNotices.bind( this, logNotices.completed ),
				showDismiss
			} );
		}
	},

	getMessage( logs, messageFunction, typeFilter ) {
		const sampleLog = ( logs[ 0 ].status === 'inProgress' ? logs[ 0 ] : logs[ logs.length - 1 ] ),
			translateArg = getTranslateArg( logs, sampleLog, typeFilter ),
			combination = getCombination( translateArg );
		return messageFunction( sampleLog.action, combination, translateArg, sampleLog );
	},

	successMessage( action, combination, translateArg ) {
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

	inProgressMessage( action, combination, translateArg ) {
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

	erroredAndCompletedMessage( logNotices ) {
		const completedMessage = this.getMessage( logNotices.completed, this.successMessage, 'completed' ),
			errorMessage = this.getMessage( logNotices.errors, this.errorMessage, 'errors' );
		return ' ' + completedMessage + ' ' + errorMessage;
	},

	errorMessage( action, combination, translateArg, sampleLog ) {
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

	additionalExplanation( error_code ) {
		switch ( error_code ) {
			case 'no_package':
				return i18n.translate( 'Plugin doesn\'t exist in the plugin repo.' );

			case 'resource_not_found':
				return i18n.translate( 'The site could not be reached.' );

			case 'download_failed':
				return i18n.translate( 'Download failed.' );

			case 'plugin_already_installed':
				return i18n.translate( 'Plugin is already installed.' );

			case 'incompatible_archive':
				return i18n.translate( 'Incompatible Archive.' );

			case 'empty_archive_pclzip':
				return i18n.translate( 'Empty archive.' );

			case 'disk_full_unzip_file':
				return i18n.translate( 'Could not copy files. You may have run out of disk space.' );

			case 'mkdir_failed_ziparchive':
			case 'mkdir_failed_pclzip':
				return i18n.translate( 'Could not create directory.' );

			case 'copy_failed_pclzip':
				return i18n.translate( 'Could not copy file.' );

			case 'md5_mismatch':
				return i18n.translate( 'The checksum of the files don\'t match.' );

			case 'bad_request':
				return i18n.translate( 'Invalid Data provided.' );

			case 'fs_unavailable':
				return i18n.translate( 'Could not access filesystem.' );

			case 'fs_error':
				return i18n.translate( 'Filesystem error.' );

			case 'fs_no_root_dir':
				return i18n.translate( 'Unable to locate WordPress Root directory.' );

			case 'fs_no_content_dir':
				return i18n.translate( 'Unable to locate WordPress Content directory (wp-content).' );

			case 'fs_no_plugins_dir':
				return i18n.translate( 'Unable to locate WordPress Plugin directory.' );

			case 'fs_no_folder':
				return i18n.translate( 'Unable to locate needed folder.' );

			case 'no_files':
				return i18n.translate( 'The package contains no files.' );

			case 'folder_exists':
				return i18n.translate( 'Destination folder already exists.' );

			case 'mkdir_failed':
				return i18n.translate( 'Could not create directory.' );

			case 'incompatible_archive':
				return i18n.translate( 'The package could not be installed.' );

			case 'files_not_writable':
				return i18n.translate( 'The update cannot be installed because we will be unable to copy some files. This is usually due to inconsistent file permissions.' );

			default:
				return null;
		}
		return null;
	},

	singleErrorMessage( action, translateArg, sampleLog ) {
		const additionalExplanation = this.additionalExplanation( sampleLog.error.error );
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate( 'Error installing %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg
						} );

					default:
						if ( additionalExplanation ) {
							translateArg.additionalExplanation = additionalExplanation;
							return i18n.translate( 'Error installing %(plugin)s on %(site)s. %(additionalExplanation)s', {
								args: translateArg
							} );
						}
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
						if ( additionalExplanation ) {
							translateArg.additionalExplanation = additionalExplanation;
							return i18n.translate( 'Error updating %(plugin)s on %(site)s. %(additionalExplanation)s', {
								args: translateArg
							} );
						}
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

	getErrorButton( log ) {
		if ( log.length > 1 ) {
			return null;
		}
		log = log.length ? log[ 0 ] : log;
		if ( log.error.error === 'unauthorized_full_access' ) {
			return i18n.translate( 'Turn On.' );
		}
		return null;
	},

	getErrorHref( log ) {
		if ( log.length > 1 ) {
			return null;
		}
		log = log.length ? log[ 0 ] : log;
		if ( log.error.error !== 'unauthorized_full_access' ) {
			return null;
		}
		let remoteManagementUrl = log.site.options.admin_url + 'admin.php?page=jetpack&configure=json-api';
		if ( versionCompare( log.site.options.jetpack_version, 3.4 ) >= 0 ) {
			remoteManagementUrl = log.site.options.admin_url + 'admin.php?page=jetpack&configure=manage';
		}
		return remoteManagementUrl;
	},

	getSuccessButton( log ) {
		if ( log.length > 1 ) {
			return null;
		}
		log = log.length ? log[ 0 ] : log;

		if ( log.action !== 'ACTIVATE_PLUGIN' ||
			! log.plugin.wp_admin_settings_page_url ) {
			return null;
		}

		return i18n.translate( 'Setup' );
	},

	getSuccessHref( log ) {
		if ( log.length > 1 ) {
			return null;
		}
		log = log.length ? log[ 0 ] : log;

		if ( log.action !== 'ACTIVATE_PLUGIN' &&
			! log.plugin.wp_admin_settings_page_url ) {
			return null;
		}
		return log.plugin.wp_admin_settings_page_url;
	}
};
