import { translate } from 'i18n-calypso';
import { ReactNode } from 'react';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	REMOVE_PLUGIN,
	UPDATE_PLUGIN,
	INSTALL_PLUGIN,
} from 'calypso/lib/plugins/constants';
import {
	PLUGIN_INSTALLATION_COMPLETED,
	PLUGIN_INSTALLATION_ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS,
	PLUGIN_INSTALLATION_UP_TO_DATE,
} from 'calypso/state/plugins/installed/status/constants';
import type { PluginActionTypes } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

type PluginActionStatusMessage = {
	[ key in PluginActionTypes ]: {
		[ PLUGIN_INSTALLATION_IN_PROGRESS ]: ReactNode;
		[ PLUGIN_INSTALLATION_COMPLETED ]?: ReactNode;
		[ PLUGIN_INSTALLATION_ERROR ]: ReactNode;
		[ PLUGIN_INSTALLATION_UP_TO_DATE ]?: ReactNode;
	};
};

/**
 * Returns an object with all the plugin action status messages.
 */
export const getPluginActionStatusMessages = (
	count: number,
	hasOneStatus: boolean,
	selectedSite?: SiteDetails
): PluginActionStatusMessage => {
	const translationArgs = {
		args: { count },
		count,
	};

	const failedStatusMessage = ( message: ReactNode ) =>
		hasOneStatus
			? message
			: translate( 'Failed on %(count)s site', 'Failed on %(count)s sites', translationArgs );

	return {
		[ ACTIVATE_PLUGIN ]: {
			[ PLUGIN_INSTALLATION_IN_PROGRESS ]: selectedSite
				? translate( 'Activating' )
				: translate(
						'Activating on %(count)s site',
						'Activating on %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_COMPLETED ]: selectedSite
				? translate( 'Activated' )
				: translate(
						'Activated on %(count)s site',
						'Activated on %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_ERROR ]: selectedSite
				? translate( 'Failed to activate' )
				: failedStatusMessage(
						translate(
							'Failed to activate on %(count)s site',
							'Failed to activate on %(count)s sites',
							translationArgs
						)
				  ),
		},
		[ DEACTIVATE_PLUGIN ]: {
			[ PLUGIN_INSTALLATION_IN_PROGRESS ]: selectedSite
				? translate( 'Deactivating' )
				: translate(
						'Deactivating on %(count)s site',
						'Deactivating on %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_COMPLETED ]: selectedSite
				? translate( 'Deactivated' )
				: translate(
						'Deactivated on %(count)s site',
						'Deactivated on %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_ERROR ]: selectedSite
				? translate( 'Failed to deactivate' )
				: failedStatusMessage(
						translate(
							'Failed to deactivate on %(count)s site',
							'Failed to deactivate on %(count)s sites',
							translationArgs
						)
				  ),
		},
		[ ENABLE_AUTOUPDATE_PLUGIN ]: {
			[ PLUGIN_INSTALLATION_IN_PROGRESS ]: selectedSite
				? translate( 'Enabling auto-updates' )
				: translate(
						'Enabling auto-updates on %(count)s site',
						'Enabling auto-updates on %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_COMPLETED ]: selectedSite
				? translate( 'Auto-update enabled' )
				: translate(
						'Auto-update enabled on %(count)s site',
						'Auto-update enabled on %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_ERROR ]: selectedSite
				? translate( 'Failed to enable auto-updates' )
				: failedStatusMessage(
						translate(
							'Failed to enable auto-updates on %(count)s site',
							'Failed to enable auto-updates on %(count)s sites',
							translationArgs
						)
				  ),
		},
		[ DISABLE_AUTOUPDATE_PLUGIN ]: {
			[ PLUGIN_INSTALLATION_IN_PROGRESS ]: selectedSite
				? translate( 'Disabling auto-updates' )
				: translate(
						'Disabling auto-updates on %(count)s site',
						'Disabling auto-updates on %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_COMPLETED ]: selectedSite
				? translate( 'Auto-update disabled' )
				: translate(
						'Auto-update disabled on %(count)s site',
						'Auto-update disabled on %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_ERROR ]: selectedSite
				? translate( 'Failed to disable auto-updates' )
				: failedStatusMessage(
						translate(
							'Failed to disable auto-updates on %(count)s site',
							'Failed to disable auto-updates on %(count)s sites',
							translationArgs
						)
				  ),
		},
		[ REMOVE_PLUGIN ]: {
			[ PLUGIN_INSTALLATION_IN_PROGRESS ]: selectedSite
				? translate( 'Removing Plugin' )
				: translate(
						'Removing plugin from %(count)s site',
						'Removing plugin from %(count)s sites',
						translationArgs
				  ),
			[ PLUGIN_INSTALLATION_ERROR ]: selectedSite
				? translate( 'Failed to remove plugin' )
				: translate(
						'Failed to remove plugin from %(count)s site',
						'Failed to remove plugin from %(count)s sites',
						translationArgs
				  ),
		},
		[ UPDATE_PLUGIN ]: {
			[ PLUGIN_INSTALLATION_IN_PROGRESS ]: translate( 'Updating' ),
			[ PLUGIN_INSTALLATION_COMPLETED ]: translate( 'Update successful' ),
			[ PLUGIN_INSTALLATION_ERROR ]: selectedSite
				? translate( 'Failed' )
				: translate( 'Failed on %(count)s site', 'Failed on %(count)s sites', translationArgs ),
			[ PLUGIN_INSTALLATION_UP_TO_DATE ]: translate( 'Plugin already up to date' ),
		},
		[ INSTALL_PLUGIN ]: {
			[ PLUGIN_INSTALLATION_IN_PROGRESS ]: translate( 'Installing' ),
			[ PLUGIN_INSTALLATION_COMPLETED ]: translate( 'Installed' ),
			[ PLUGIN_INSTALLATION_ERROR ]: translate( 'Failed to install' ),
		},
	};
};
