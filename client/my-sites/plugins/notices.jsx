/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { uniqBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * WordPress dependencies
 */
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
	PLUGIN_UPLOAD,
	RECEIVE_PLUGINS,
	REMOVE_PLUGIN,
	UPDATE_PLUGIN,
} from 'calypso/lib/plugins/constants';
import {
	errorNotice,
	infoNotice,
	successNotice,
	warningNotice,
} from 'calypso/state/notices/actions';
import { filterNotices, isSamePluginIdSlug } from 'calypso/lib/plugins/utils';
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
		return this.props.plugins.find(
			( { id, slug } ) =>
				( id && isSamePluginIdSlug( id, pluginId ) ) ||
				( slug && isSamePluginIdSlug( slug, pluginId ) )
		);
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
			this.props.infoNotice(
				this.getMessage( currentNotices.inProgress, this.inProgressMessage, 'inProgress' ),
				{
					id: 'plugin-notice',
				}
			);
			return;
		}

		if ( currentNotices.completed.length > 0 && currentNotices.errors.length > 0 ) {
			this.props.warningNotice( this.erroredAndCompletedMessage( currentNotices ), {
				onDismissClick: () => this.props.removePluginStatuses( 'completed', 'error' ),
				id: 'plugin-notice',
			} );
		} else if ( currentNotices.errors.length > 0 ) {
			this.props.errorNotice(
				this.getMessage( currentNotices.errors, this.errorMessage, 'error' ),
				{
					onDismissClick: () => this.props.removePluginStatuses( 'error' ),
					id: 'plugin-notice',
				}
			);
		} else if ( currentNotices.completed.length > 0 ) {
			this.props.successNotice(
				this.getMessage( currentNotices.completed, this.successMessage, 'completed' ),
				{
					onDismissClick: () => this.props.removePluginStatuses( 'completed' ),
					id: 'plugin-notice',
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
		const { translate } = this.props;

		switch ( action ) {
			case INSTALL_PLUGIN:
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
			case REMOVE_PLUGIN:
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
			case UPDATE_PLUGIN:
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
			case ACTIVATE_PLUGIN:
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
			case DEACTIVATE_PLUGIN:
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
			case ENABLE_AUTOUPDATE_PLUGIN:
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
			case DISABLE_AUTOUPDATE_PLUGIN:
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
			case PLUGIN_UPLOAD:
				return translate( "You've successfully installed the %(plugin)s plugin.", {
					args: translateArg,
				} );
		}
	};

	inProgressMessage = ( action, combination, translateArg ) => {
		const { translate } = this.props;

		switch ( action ) {
			case INSTALL_PLUGIN:
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
			case REMOVE_PLUGIN:
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
			case UPDATE_PLUGIN:
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
			case ACTIVATE_PLUGIN:
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
			case DEACTIVATE_PLUGIN:
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
			case ENABLE_AUTOUPDATE_PLUGIN:
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
			case DISABLE_AUTOUPDATE_PLUGIN:
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
		const { translate } = this.props;

		if ( combination === '1 site 1 plugin' ) {
			return this.singleErrorMessage( action, translateArg, sampleLog );
		}
		switch ( action ) {
			case INSTALL_PLUGIN:
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
			case REMOVE_PLUGIN:
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
			case UPDATE_PLUGIN:
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
			case ACTIVATE_PLUGIN:
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
			case DEACTIVATE_PLUGIN:
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
			case ENABLE_AUTOUPDATE_PLUGIN:
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
			case DISABLE_AUTOUPDATE_PLUGIN:
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
			case RECEIVE_PLUGINS:
				return translate(
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
		const { translate } = this.props;

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
	};

	singleErrorMessage = ( action, translateArg, sampleLog ) => {
		const { translate } = this.props;
		const additionalExplanation = this.additionalExplanation( sampleLog.error.error );

		switch ( action ) {
			case INSTALL_PLUGIN:
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

			case REMOVE_PLUGIN:
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

			case UPDATE_PLUGIN:
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

			case ACTIVATE_PLUGIN:
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

			case DEACTIVATE_PLUGIN:
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

			case ENABLE_AUTOUPDATE_PLUGIN:
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

			case DISABLE_AUTOUPDATE_PLUGIN:
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

			case RECEIVE_PLUGINS:
				return translate( 'Error fetching plugins on %(site)s.', {
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
		errorNotice,
		infoNotice,
		removePluginStatuses,
		successNotice,
		warningNotice,
	}
)( localize( PluginNotices ) );
