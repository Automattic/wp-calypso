import {
	PLUGIN_INSTALLATION_COMPLETED as COMPLETED,
	PLUGIN_INSTALLATION_ERROR as ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS as IN_PROGRESS,
} from 'calypso/state/plugins/installed/status/constants';
import type { PluginActionMessagesByStatus } from './types';

const DeactivateMessages: PluginActionMessagesByStatus = {
	[ IN_PROGRESS ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Deactivating' )
			: ( translate ) =>
					translate( 'Deactivating on %(count)s site', 'Deactivating on %(count)s sites', {
						args: { count: siteCount },
						count: siteCount,
					} ),
	[ COMPLETED ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Deactivated' )
			: ( translate ) =>
					translate( 'Deactivated on %(count)s site', 'Deactivated on %(count)s sites', {
						args: { count: siteCount },
						count: siteCount,
					} ),
	[ ERROR ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Failed to deactivate' )
			: ( translate ) =>
					translate(
						'Failed to deactivate on %(count)s site',
						'Failed to deactivate on %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
};

export default DeactivateMessages;
