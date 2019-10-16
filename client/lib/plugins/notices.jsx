/**
 * External dependencies
 */
import { get, uniqBy } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'notices';
import PluginsLog from 'lib/plugins/log-store';
import PluginsActions from 'lib/plugins/actions';
import { filterNotices } from 'lib/plugins/utils';
import versionCompare from 'lib/version-compare';

function getCombination( translateArg ) {
	return (
		( translateArg.numberOfSites > 1 ? 'n sites' : '1 site' ) +
		' ' +
		( translateArg.numberOfPlugins > 1 ? 'n plugins' : '1 plugin' )
	);
}

function getTranslateArg( logs, sampleLog, typeFilter ) {
	const filteredLogs = logs.filter( log => {
		return log.status === typeFilter ? typeFilter : sampleLog.type;
	} );

	const numberOfSites = uniqBy( filteredLogs, 'site.ID' ).length;
	const numberOfPlugins = uniqBy( filteredLogs, 'plugin.slug' ).length;

	return {
		plugin: get( sampleLog, 'plugin.name' ),
		wp_admin_settings_page_url: get( sampleLog, 'plugin.wp_admin_settings_page_url' ),
		numberOfPlugins,
		site: get( sampleLog, 'site.title' ),
		isMultiSite: get( sampleLog, 'site.is_multi_site' ),
		numberOfSites,
	};
}

export default {
	shouldComponentUpdateNotices( currentNotices, nextNotices ) {
		if ( currentNotices.errors && currentNotices.errors.length !== nextNotices.errors.length ) {
			return true;
		}
		if (
			currentNotices.inProgress &&
			currentNotices.inProgress.length !== nextNotices.inProgress.length
		) {
			return true;
		}
		if (
			currentNotices.completed &&
			currentNotices.completed.length !== nextNotices.completed.length
		) {
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
		const site = this.props.selectedSite;
		return {
			errors: filterNotices( PluginsLog.getErrors(), site, this.props.pluginSlug ),
			inProgress: filterNotices( PluginsLog.getInProgress(), site, this.props.pluginSlug ),
			completed: filterNotices( PluginsLog.getCompleted(), site, this.props.pluginSlug ),
		};
	},

	showNotification() {
		const logNotices = this.refreshPluginNotices();
		this.setState( { notices: logNotices } );
		if ( logNotices.inProgress.length > 0 ) {
			notices.info(
				this.getMessage( logNotices.inProgress, this.inProgressMessage, 'inProgress' )
			);
			return;
		}

		if ( logNotices.completed.length > 0 && logNotices.errors.length > 0 ) {
			notices.warning( this.erroredAndCompletedMessage( logNotices ), {
				onRemoveCallback: () => PluginsActions.removePluginsNotices( 'completed', 'error' ),
			} );
		} else if ( logNotices.errors.length > 0 ) {
			notices.error( this.getMessage( logNotices.errors, this.errorMessage, 'error' ), {
				button: this.getErrorButton( logNotices.errors ),
				href: this.getErrorHref( logNotices.errors ),
				onRemoveCallback: () => PluginsActions.removePluginsNotices( 'error' ),
			} );
		} else if ( logNotices.completed.length > 0 ) {
			const sampleLog =
					logNotices.completed[ 0 ].status === 'inProgress'
						? logNotices.completed[ 0 ]
						: logNotices.completed[ logNotices.completed.length - 1 ],
				// the dismiss button would overlap the link to the settings page when activating
				showDismiss =
					sampleLog.action !== 'ACTIVATE_PLUGIN' ||
					! get( sampleLog, 'plugin.wp_admin_settings_page_url' );

			notices.success( this.getMessage( logNotices.completed, this.successMessage, 'completed' ), {
				button: this.getSuccessButton( logNotices.completed ),
				href: this.getSuccessHref( logNotices.completed ),
				onRemoveCallback: () => PluginsActions.removePluginsNotices( 'completed' ),
				showDismiss,
			} );
		}
	},

	getMessage( logs, messageFunction, typeFilter ) {
		const sampleLog = logs[ 0 ].status === 'inProgress' ? logs[ 0 ] : logs[ logs.length - 1 ],
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
							return translate( 'Successfully installed %(plugin)s on %(site)s.', {
								args: translateArg,
							} );
						case '1 site n plugins':
							return translate( 'Successfully installed %(numberOfPlugins)d plugins on %(site)s.', {
								args: translateArg,
							} );
						case 'n sites 1 plugin':
							return translate( 'Successfully installed %(plugin)s on %(numberOfSites)d sites.', {
								args: translateArg,
							} );
						case 'n sites n plugins':
							return translate(
								'Successfully installed %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
								{
									args: translateArg,
								}
							);
					}
				}
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Successfully installed and activated %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate(
							'Successfully installed and activated %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate(
							'Successfully installed and activated %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return translate(
							'Successfully installed and activated %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}

				break;
			case 'REMOVE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Successfully removed %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Successfully removed %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Successfully removed %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Successfully removed %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'UPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Successfully updated %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Successfully updated %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Successfully updated %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Successfully updated %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'ACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Successfully activated %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Successfully activated %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Successfully activated %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Successfully activated %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'DEACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Successfully deactivated %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Successfully deactivated %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Successfully deactivated %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Successfully deactivated %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Successfully enabled autoupdates for %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate(
							'Successfully enabled autoupdates for %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate(
							'Successfully enabled autoupdates for %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return translate(
							'Successfully enabled autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Successfully disabled autoupdates for %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate(
							'Successfully disabled autoupdates for %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate(
							'Successfully disabled autoupdates for %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return translate(
							'Successfully disabled autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'PLUGIN_UPLOAD':
				return translate( "You've successfully installed the %(plugin)s plugin.", {
					args: translateArg,
				} );
		}
	},

	inProgressMessage( action, combination, translateArg ) {
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Installing %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Installing %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Installing %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Installing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
				}
				break;
			case 'REMOVE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Removing %(plugin)s on %(site)s.', { args: translateArg } );
					case '1 site n plugins':
						return translate( 'Removing %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Removing %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate( 'Removing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
				}
				break;
			case 'UPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Updating %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Updating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Updating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate( 'Updating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
				}
				break;
			case 'ACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Activating %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Activating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Activating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Activating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
				}
				break;
			case 'DEACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Deactivating %(plugin)s on %(site)s', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Deactivating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Deactivating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Deactivating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
				}
				break;
			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Enabling autoupdates for %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate( 'Enabling autoupdates for %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return translate( 'Enabling autoupdates for %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Enabling autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
				}
				break;
			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return translate( 'Disabling autoupdates for %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return translate(
							'Disabling autoupdates for %(numberOfPlugins)d plugins on %(site)s.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate( 'Disabling autoupdates for %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'Disabling autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
				}
				break;
		}
	},

	erroredAndCompletedMessage( logNotices ) {
		const completedMessage = this.getMessage(
				logNotices.completed,
				this.successMessage,
				'completed'
			),
			errorMessage = this.getMessage( logNotices.errors, this.errorMessage, 'error' );
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
						return translate(
							'There were errors installing %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate(
							'There were errors installing %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return translate(
							'There were errors installing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'REMOVE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return translate(
							'There were errors removing %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate( 'There were errors removing %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'There were errors removing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'UPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return translate(
							'There were errors updating %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate( 'There were errors updating %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return translate(
							'There were errors updating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'ACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return translate(
							'There were errors activating %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate(
							'There were errors activating %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return translate(
							'There were errors activating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'DEACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return translate(
							'There were errors deactivating %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate(
							'There were errors deactivating %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return translate(
							'There were errors deactivating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return translate(
							'There were errors enabling autoupdates %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate(
							'There were errors enabling autoupdates %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return translate(
							'There were errors enabling autoupdates %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return translate(
							'There were errors disabling autoupdates %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return translate(
							'There were errors disabling autoupdates %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return translate(
							'There were errors disabling autoupdates %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'RECEIVE_PLUGINS':
				return translate(
					'Error fetching plugins on %(numberOfSites)d site.',
					'Error fetching plugins on %(numberOfSites)d sites.',
					{
						count: translateArg.numberOfSites,
						args: translateArg,
					}
				);
		}
	},

	additionalExplanation( error_code ) {
		switch ( error_code ) {
			case 'no_package':
				return translate( "Plugin doesn't exist in the plugin repo." );

			case 'resource_not_found':
				return translate( 'The site could not be reached.' );

			case 'download_failed':
				return translate( 'Download failed.' );

			case 'plugin_already_installed':
				return translate( 'Plugin is already installed.' );

			case 'incompatible_archive':
				return translate( 'Incompatible Archive. The package could not be installed.' );

			case 'empty_archive_pclzip':
				return translate( 'Empty archive.' );

			case 'disk_full_unzip_file':
				return translate( 'Could not copy files. You may have run out of disk space.' );

			case 'mkdir_failed_ziparchive':
			case 'mkdir_failed_pclzip':
				return translate( 'Could not create directory.' );

			case 'copy_failed_pclzip':
				return translate( 'Could not copy file.' );

			case 'md5_mismatch':
				return translate( "The checksum of the files don't match." );

			case 'bad_request':
				return translate( 'Invalid Data provided.' );

			case 'fs_unavailable':
				return translate( 'Could not access filesystem.' );

			case 'fs_error':
				return translate( 'Filesystem error.' );

			case 'fs_no_root_dir':
				return translate( 'Unable to locate WordPress Root directory.' );

			case 'fs_no_content_dir':
				return translate( 'Unable to locate WordPress Content directory (wp-content).' );

			case 'fs_no_plugins_dir':
				return translate( 'Unable to locate WordPress Plugin directory.' );

			case 'fs_no_folder':
				return translate( 'Unable to locate needed folder.' );

			case 'no_files':
				return translate( 'The package contains no files.' );

			case 'folder_exists':
				return translate( 'Destination folder already exists.' );

			case 'mkdir_failed':
				return translate( 'Could not create directory.' );

			case 'files_not_writable':
				return translate(
					'The update cannot be installed because we will be unable to copy some files. This is usually due to inconsistent file permissions.'
				);
		}

		return null;
	},

	singleErrorMessage( action, translateArg, sampleLog ) {
		const additionalExplanation = this.additionalExplanation( sampleLog.error.error );
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return translate(
							'Error installing %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);

					default:
						if ( additionalExplanation ) {
							translateArg.additionalExplanation = additionalExplanation;
							return translate(
								'Error installing %(plugin)s on %(site)s. %(additionalExplanation)s',
								{
									args: translateArg,
								}
							);
						}
						return translate( 'An error occurred while installing %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'REMOVE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return translate( 'Error removing %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg,
						} );
					default:
						return translate( 'An error occurred while removing %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'UPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return translate( 'Error updating %(plugin)s on %(site)s, remote management is off.', {
							args: translateArg,
						} );
					default:
						if ( additionalExplanation ) {
							translateArg.additionalExplanation = additionalExplanation;
							return translate(
								'Error updating %(plugin)s on %(site)s. %(additionalExplanation)s',
								{
									args: translateArg,
								}
							);
						}
						return translate( 'An error occurred while updating %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'ACTIVATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return translate(
							'Error activating %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return translate( 'An error occurred while activating %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'DEACTIVATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return translate(
							'Error deactivating %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return translate( 'An error occurred while deactivating %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return translate(
							'Error enabling autoupdates for %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return translate(
							'An error occurred while enabling autoupdates for %(plugin)s on %(site)s.',
							{
								args: translateArg,
							}
						);
				}

			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return translate(
							'Error disabling autoupdates for %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return translate(
							'An error occurred while disabling autoupdates for %(plugin)s on %(site)s.',
							{
								args: translateArg,
							}
						);
				}

			case 'RECEIVE_PLUGINS':
				return translate( 'Error fetching plugins on %(site)s.', {
					args: translateArg,
				} );
		}
	},

	getErrorButton( log ) {
		if ( log.length > 1 ) {
			return null;
		}
		log = log.length ? log[ 0 ] : log;
		if ( log.error.error === 'unauthorized_full_access' ) {
			return translate( 'Turn On.' );
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
		let remoteManagementUrl =
			log.site.options.admin_url + 'admin.php?page=jetpack&configure=json-api';
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

		if ( log.action !== 'ACTIVATE_PLUGIN' || ! get( log, 'plugin.wp_admin_settings_page_url' ) ) {
			return null;
		}

		return translate( 'Setup' );
	},

	getSuccessHref( log ) {
		if ( log.length > 1 ) {
			return null;
		}
		log = log.length ? log[ 0 ] : log;

		if ( log.action !== 'ACTIVATE_PLUGIN' || ! get( log, 'plugin.wp_admin_settings_page_url' ) ) {
			return null;
		}
		return get( log, 'plugin.wp_admin_settings_page_url' );
	},
};
