import {
	PLUGIN_INSTALLATION_COMPLETED as COMPLETED,
	PLUGIN_INSTALLATION_ERROR as ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS as IN_PROGRESS,
} from 'calypso/state/plugins/installed/status/constants';
import type { PluginActionMessagesByStatus } from './types';

const DisableAutoUpdateMessages: PluginActionMessagesByStatus = {
	[ IN_PROGRESS ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Disabling auto-updates' )
			: ( translate ) =>
					translate(
						'Disabling auto-updates on %(count)s site',
						'Disabling auto-updates on %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
	[ COMPLETED ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Auto-update disabled' )
			: ( translate ) =>
					translate(
						'Auto-update disabled on %(count)s site',
						'Auto-update disabled on %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
	[ ERROR ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Failed to disable auto-updates' )
			: ( translate ) =>
					translate(
						'Failed to disable auto-updates on %(count)s site',
						'Failed to disable auto-updates on %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
};

export default DisableAutoUpdateMessages;
