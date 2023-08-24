import { PluginActionName } from '../../types';
import { ActionTexts } from '../types';
import activate from './activate';
import deactivate from './deactivate';
import disableAutoUpdates from './disable-autoupdates';
import enableAutoUpdates from './enable-autoupdates';
import remove from './remove';
import unspecifiedAction from './unspecified-action';
import update from './update';

const ALL_ACTIONS: Record< PluginActionName, ActionTexts > = {
	activate,
	deactivate,
	remove,
	update,
	enableAutoUpdates,
	disableAutoUpdates,
};

export const getActionTexts = ( action: string ) =>
	( ALL_ACTIONS as Record< string, ActionTexts > )[ action ] ?? unspecifiedAction;
