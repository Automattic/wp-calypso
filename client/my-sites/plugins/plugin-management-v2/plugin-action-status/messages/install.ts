import {
	PLUGIN_INSTALLATION_COMPLETED as COMPLETED,
	PLUGIN_INSTALLATION_ERROR as ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS as IN_PROGRESS,
	PLUGIN_INSTALLATION_INCOMPLETED as INCOMPLETED,
} from 'calypso/state/plugins/installed/status/constants';
import type { PluginActionMessagesByStatus } from './types';

const InstallMessages: PluginActionMessagesByStatus = {
	[ IN_PROGRESS ]: () => ( translate ) => translate( 'Installing' ),
	[ COMPLETED ]: () => ( translate ) => translate( 'Installed' ),
	[ ERROR ]: () => ( translate ) => translate( 'Failed to install' ),
	[ INCOMPLETED ]: () => ( translate ) => translate( 'Failed to complete install' ),
};

export default InstallMessages;
