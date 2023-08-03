import {
	PLUGIN_INSTALLATION_IN_PROGRESS as IN_PROGRESS,
	PLUGIN_INSTALLATION_ERROR as ERROR,
} from 'calypso/state/plugins/installed/status/constants';
import { PluginActionMessagesByStatus } from './types';

const RemoveMessages: PluginActionMessagesByStatus = {
	[ IN_PROGRESS ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Removing Plugin' )
			: ( translate ) =>
					translate(
						'Removing plugin from %(count)s site',
						'Removing plugin from %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
	[ ERROR ]: ( { hasSelectedSite, siteCount } ) =>
		hasSelectedSite
			? ( translate ) => translate( 'Failed to remove plugin' )
			: ( translate ) =>
					translate(
						'Failed to remove plugin from %(count)s site',
						'Failed to remove plugin from %(count)s sites',
						{ args: { count: siteCount }, count: siteCount }
					),
};

export default RemoveMessages;
