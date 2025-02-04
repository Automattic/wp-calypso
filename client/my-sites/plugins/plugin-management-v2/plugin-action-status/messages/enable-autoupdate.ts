import {
	PLUGIN_INSTALLATION_COMPLETED as COMPLETED,
	PLUGIN_INSTALLATION_ERROR as ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS as IN_PROGRESS,
} from 'calypso/state/plugins/installed/status/constants';
import type { PluginActionMessagesByStatus } from './types';

const EnableAutoUpdateMessages: PluginActionMessagesByStatus = {
	[ IN_PROGRESS ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Enabling auto-updates' )
			: ( translate ) =>
					translate(
						'Enabling auto-updates on %(count)s site',
						'Enabling auto-updates on %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
	[ COMPLETED ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Auto-update enabled' )
			: ( translate ) =>
					translate(
						'Auto-update enabled on %(count)s site',
						'Auto-update enabled on %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
	[ ERROR ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Failed to enable auto-updates' )
			: ( translate ) =>
					translate(
						'Failed to enable auto-updates on %(count)s site',
						'Failed to enable auto-updates on %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
};

export default EnableAutoUpdateMessages;
