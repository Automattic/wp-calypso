import {
	PLUGIN_INSTALLATION_COMPLETED as COMPLETED,
	PLUGIN_INSTALLATION_ERROR as ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS as IN_PROGRESS,
	PLUGIN_INSTALLATION_UP_TO_DATE as UP_TO_DATE,
} from 'calypso/state/plugins/installed/status/constants';
import type { PluginActionMessagesByStatus } from './types';

const UpdateMessages: PluginActionMessagesByStatus = {
	[ IN_PROGRESS ]: () => ( translate ) => translate( 'Updating' ),
	[ COMPLETED ]: () => ( translate ) => translate( 'Update successful' ),
	[ ERROR ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Failed' )
			: ( translate ) =>
					translate( 'Failed on %(count)s site', 'Failed on %(count)s sites', {
						args: { count: siteCount },
						count: siteCount,
					} ),
	[ UP_TO_DATE ]: () => ( translate ) => translate( 'Plugin already up to date' ),
};

export default UpdateMessages;
