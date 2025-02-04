import {
	PLUGIN_INSTALLATION_COMPLETED as COMPLETED,
	PLUGIN_INSTALLATION_ERROR as ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS as IN_PROGRESS,
} from 'calypso/state/plugins/installed/status/constants';
import type { PluginActionMessagesByStatus } from './types';

const ActivateMessages: PluginActionMessagesByStatus = {
	[ IN_PROGRESS ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Activating' )
			: ( translate ) =>
					translate( 'Activating on %(count)s site', 'Activating on %(count)s sites', {
						args: { count: siteCount },
						count: siteCount,
					} ),
	[ COMPLETED ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Activated' )
			: ( translate ) =>
					translate( 'Activated on %(count)s site', 'Activated on %(count)s sites', {
						args: { count: siteCount },
						count: siteCount,
					} ),
	[ ERROR ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Failed to activate' )
			: ( translate ) =>
					translate(
						'Failed to activate on %(count)s site',
						'Failed to activate on %(count)s sites',
						{
							args: { count: siteCount },
							count: siteCount,
						}
					),
};

export default ActivateMessages;
