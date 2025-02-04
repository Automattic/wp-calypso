import {
	ACTIVATE_PLUGIN as ACTIVATE,
	DEACTIVATE_PLUGIN as DEACTIVATE,
	DISABLE_AUTOUPDATE_PLUGIN as DISABLE_AUTOUPDATE,
	ENABLE_AUTOUPDATE_PLUGIN as ENABLE_AUTOUPDATE,
	REMOVE_PLUGIN as REMOVE,
	UPDATE_PLUGIN as UPDATE,
	INSTALL_PLUGIN as INSTALL,
} from 'calypso/lib/plugins/constants';
import ActivateMessages from './activate';
import DeactivateMessages from './deactivate';
import DisableAutoUpdateMessages from './disable-autoupdate';
import EnableAutoUpdateMessages from './enable-autoupdate';
import InstallMessages from './install';
import RemoveMessages from './remove';
import UpdateMessages from './update';
import type { PluginActionMessagesByStatus } from './types';
import type { PluginActionTypes } from '../../types';

const AllMessagesByAction: Record< PluginActionTypes, PluginActionMessagesByStatus > = {
	[ INSTALL ]: InstallMessages,
	[ ACTIVATE ]: ActivateMessages,
	[ UPDATE ]: UpdateMessages,
	[ DEACTIVATE ]: DeactivateMessages,
	[ REMOVE ]: RemoveMessages,
	[ ENABLE_AUTOUPDATE ]: EnableAutoUpdateMessages,
	[ DISABLE_AUTOUPDATE ]: DisableAutoUpdateMessages,
};

export default AllMessagesByAction;
