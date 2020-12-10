/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { uniqBy } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * WordPress dependencies
 */
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import { filterNotices } from 'calypso/lib/plugins/utils';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { getPluginStatusesByType } from 'calypso/state/plugins/installed/selectors';

class PluginNotices extends React.Component {
	componentDidUpdate( prevProps ) {
		const currentNotices = this.extractNoticeProps( this.props );
		const prevNotices = this.extractNoticeProps( prevProps );

		if ( ! isShallowEqual( currentNotices, prevNotices ) ) {
			this.showNotification();
		}
	}

	extractNoticeProps( { completedNotices, errorNotices, inProgressNotices } ) {
		return {
			completedNotices,
			errorNotices,
			inProgressNotices,
		};
	}

	getCurrentNotices = () => {
		const { completedNotices, errorNotices, inProgressNotices, pluginId, siteId } = this.props;

		return {
			errors: filterNotices( errorNotices, siteId, pluginId ),
			inProgress: filterNotices( inProgressNotices, siteId, pluginId ),
			completed: filterNotices( completedNotices, siteId, pluginId ),
		};
	};

	getPluginById( pluginId ) {
		return this.props.plugins.find( ( plugin ) => plugin.id === pluginId );
	}

	getCombination( translateArg ) {
		return (
			( translateArg.numberOfSites > 1 ? 'n sites' : '1 site' ) +
			' ' +
			( translateArg.numberOfPlugins > 1 ? 'n plugins' : '1 plugin' )
		);
	}

	getTranslateArg( logs, sampleLog, typeFilter ) {
		const filteredLogs = logs.filter( ( log ) => {
			return log.status === typeFilter ? typeFilter : sampleLog.type;
		} );

		const numberOfSites = uniqBy( filteredLogs, 'siteId' ).length;
		const numberOfPlugins = uniqBy( filteredLogs, 'pluginId' ).length;

		const logSite = this.props.sites.find( ( site ) => parseInt( sampleLog.siteId ) === site?.ID );
		const logPlugin = this.getPluginById( sampleLog.pluginId );

		return {
			plugin: logPlugin?.name,
			numberOfPlugins,
			site: logSite?.title,
			isMultiSite: logSite?.is_multi_site,
			numberOfSites,
		};
	}

	showNotification = () => {
		const currentNotices = this.getCurrentNotices();

		if ( currentNotices.inProgress.length > 0 ) {
			notices.info(
				this.getMessage( currentNotices.inProgress, this.inProgressMessage, 'inProgress' )
			);
			return;
		}

		if ( currentNotices.completed.length > 0 && currentNotices.errors.length > 0 ) {
			notices.warning( this.erroredAndCompletedMessage( currentNotices ), {
				onRemoveCallback: () => this.props.removePluginStatuses( 'completed', 'error' ),
			} );
		} else if ( currentNotices.errors.length > 0 ) {
			notices.error( this.getMessage( currentNotices.errors, this.errorMessage, 'error' ), {
				onRemoveCallback: () => this.props.removePluginStatuses( 'error' ),
			} );
		} else if ( currentNotices.completed.length > 0 ) {
			notices.success(
				this.getMessage( currentNotices.completed, this.successMessage, 'completed' ),
				{
					onRemoveCallback: () => this.props.removePluginStatuses( 'completed' ),
					showDismiss: true,
				}
			);
		}
	};

	getMessage = ( logs, messageFunction, typeFilter ) => {
		const sampleLog = logs[ 0 ].status === 'inProgress' ? logs[ 0 ] : logs[ logs.length - 1 ];
		const translateArg = this.getTranslateArg( logs, sampleLog, typeFilter );
		const combination = this.getCombination( translateArg );
		return messageFunction( sampleLog.action, combination, translateArg, sampleLog );
	};

	successMessage = ( action, combination, translateArg ) => {
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				if ( translateArg.isMultiSite ) {
					switch ( combination ) {
						case '1 site 1 plugin':
							return i18n.translate( 'Successfully installed %(plugin)s on %(site)s.', {
								args: translateArg,
							} );
						case '1 site n plugins':
							return i18n.translate(
								'Successfully installed %(numberOfPlugins)d plugins on %(site)s.',
								{
									args: translateArg,
								}
							);
						case 'n sites 1 plugin':
							return i18n.translate(
								'Successfully installed %(plugin)s on %(numberOfSites)d sites.',
								{
									args: translateArg,
								}
							);
						case 'n sites n plugins':
							return i18n.translate(
								'Successfully installed %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
								{
									args: translateArg,
								}
							);
					}
				}
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Successfully installed and activated %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate(
							'Successfully installed and activated %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'Successfully installed and activated %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Successfully removed %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate(
							'Successfully removed %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully removed %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Successfully updated %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate(
							'Successfully updated %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate( 'Successfully updated %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Successfully activated %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate(
							'Successfully activated %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'Successfully activated %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Successfully deactivated %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate(
							'Successfully deactivated %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'Successfully deactivated %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Successfully enabled autoupdates for %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate(
							'Successfully enabled autoupdates for %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'Successfully enabled autoupdates for %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate(
							'Successfully disabled autoupdates for %(plugin)s on %(site)s.',
							{
								args: translateArg,
							}
						);
					case '1 site n plugins':
						return i18n.translate(
							'Successfully disabled autoupdates for %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'Successfully disabled autoupdates for %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
							'Successfully disabled autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'PLUGIN_UPLOAD':
				return i18n.translate( "You've successfully installed the %(plugin)s plugin.", {
					args: translateArg,
				} );
		}
	};

	inProgressMessage = ( action, combination, translateArg ) => {
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Installing %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate( 'Installing %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Installing %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Removing %(plugin)s on %(site)s.', { args: translateArg } );
					case '1 site n plugins':
						return i18n.translate( 'Removing %(numberOfPlugins)d plugins on %(site)s.', {
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Removing %(plugin)s on %(numberOfSites)d sites.', {
							args: translateArg,
						} );
					case 'n sites n plugins':
						return i18n.translate(
							'Removing %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'UPDATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Updating %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate( 'Updating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Updating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return i18n.translate(
							'Updating %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
				}
				break;
			case 'ACTIVATE_PLUGIN':
				switch ( combination ) {
					case '1 site 1 plugin':
						return i18n.translate( 'Activating %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate( 'Activating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Activating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Deactivating %(plugin)s on %(site)s', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate( 'Deactivating %(numberOfPlugins)d plugins on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites 1 plugin':
						return i18n.translate( 'Deactivating %(plugin)s on %(numberOfSites)d sites.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Enabling autoupdates for %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate(
							'Enabling autoupdates for %(numberOfPlugins)d plugins on %(site)s.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'Enabling autoupdates for %(plugin)s on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate( 'Disabling autoupdates for %(plugin)s on %(site)s.', {
							context: 'In progress message',
							args: translateArg,
						} );
					case '1 site n plugins':
						return i18n.translate(
							'Disabling autoupdates for %(numberOfPlugins)d plugins on %(site)s.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'Disabling autoupdates for %(plugin)s on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
							'Disabling autoupdates for %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								context: 'In progress message',
								args: translateArg,
							}
						);
				}
				break;
		}
	};

	erroredAndCompletedMessage = ( currentNotices ) => {
		const completedMessage = this.getMessage(
			currentNotices.completed,
			this.successMessage,
			'completed'
		);
		const errorMessage = this.getMessage( currentNotices.errors, this.errorMessage, 'error' );
		return ' ' + completedMessage + ' ' + errorMessage;
	};

	errorMessage = ( action, combination, translateArg, sampleLog ) => {
		if ( combination === '1 site 1 plugin' ) {
			return this.singleErrorMessage( action, translateArg, sampleLog );
		}
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( combination ) {
					case '1 site n plugins':
						return i18n.translate(
							'There were errors installing %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'There were errors installing %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate(
							'There were errors removing %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'There were errors removing %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate(
							'There were errors updating %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'There were errors updating %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate(
							'There were errors activating %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'There were errors activating %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate(
							'There were errors deactivating %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'There were errors deactivating %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate(
							'There were errors enabling autoupdates %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'There were errors enabling autoupdates %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
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
						return i18n.translate(
							'There were errors disabling autoupdates %(numberOfPlugins)d plugins on %(site)s.',
							{
								args: translateArg,
							}
						);
					case 'n sites 1 plugin':
						return i18n.translate(
							'There were errors disabling autoupdates %(plugin)s on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
					case 'n sites n plugins':
						return i18n.translate(
							'There were errors disabling autoupdates %(numberOfPlugins)d plugins on %(numberOfSites)d sites.',
							{
								args: translateArg,
							}
						);
				}
				break;
			case 'RECEIVE_PLUGINS':
				return i18n.translate(
					'Error fetching plugins on %(numberOfSites)d site.',
					'Error fetching plugins on %(numberOfSites)d sites.',
					{
						count: translateArg.numberOfSites,
						args: translateArg,
					}
				);
		}
	};

	additionalExplanation = ( error_code ) => {
		switch ( error_code ) {
			case 'no_package':
				return i18n.translate( "Plugin doesn't exist in the plugin repo." );

			case 'resource_not_found':
				return i18n.translate( 'The site could not be reached.' );

			case 'download_failed':
				return i18n.translate( 'Download failed.' );

			case 'plugin_already_installed':
				return i18n.translate( 'Plugin is already installed.' );

			case 'incompatible_archive':
				return i18n.translate( 'Incompatible Archive. The package could not be installed.' );

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
				return i18n.translate( "The checksum of the files don't match." );

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

			case 'files_not_writable':
				return i18n.translate(
					'The update cannot be installed because we will be unable to copy some files. This is usually due to inconsistent file permissions.'
				);
		}

		return null;
	};

	singleErrorMessage = ( action, translateArg, sampleLog ) => {
		const additionalExplanation = this.additionalExplanation( sampleLog.error.error );
		switch ( action ) {
			case 'INSTALL_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate(
							'Error installing %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);

					default:
						if ( additionalExplanation ) {
							translateArg.additionalExplanation = additionalExplanation;
							return i18n.translate(
								'Error installing %(plugin)s on %(site)s. %(additionalExplanation)s',
								{
									args: translateArg,
								}
							);
						}
						return i18n.translate( 'An error occurred while installing %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'REMOVE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate(
							'Error removing %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return i18n.translate( 'An error occurred while removing %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'UPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate(
							'Error updating %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						if ( additionalExplanation ) {
							translateArg.additionalExplanation = additionalExplanation;
							return i18n.translate(
								'Error updating %(plugin)s on %(site)s. %(additionalExplanation)s',
								{
									args: translateArg,
								}
							);
						}
						return i18n.translate( 'An error occurred while updating %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'ACTIVATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate(
							'Error activating %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return i18n.translate( 'An error occurred while activating %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'DEACTIVATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate(
							'Error deactivating %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return i18n.translate( 'An error occurred while deactivating %(plugin)s on %(site)s.', {
							args: translateArg,
						} );
				}

			case 'ENABLE_AUTOUPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate(
							'Error enabling autoupdates for %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return i18n.translate(
							'An error occurred while enabling autoupdates for %(plugin)s on %(site)s.',
							{
								args: translateArg,
							}
						);
				}

			case 'DISABLE_AUTOUPDATE_PLUGIN':
				switch ( sampleLog.error.error ) {
					case 'unauthorized_full_access':
						return i18n.translate(
							'Error disabling autoupdates for %(plugin)s on %(site)s, remote management is off.',
							{
								args: translateArg,
							}
						);
					default:
						return i18n.translate(
							'An error occurred while disabling autoupdates for %(plugin)s on %(site)s.',
							{
								args: translateArg,
							}
						);
				}

			case 'RECEIVE_PLUGINS':
				return i18n.translate( 'Error fetching plugins on %(site)s.', {
					args: translateArg,
				} );
		}
	};

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		completedNotices: getPluginStatusesByType( state, 'completed' ),
		errorNotices: getPluginStatusesByType( state, 'error' ),
		inProgressNotices: getPluginStatusesByType( state, 'inProgress' ),
		siteId: getSelectedSiteId( state ),
	} ),
	{
		removePluginStatuses,
	}
)( PluginNotices );
