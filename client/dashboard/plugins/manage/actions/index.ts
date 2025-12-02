import { activateAction } from './activate';
import { deactivateAction } from './deactivate';
import { deleteAction } from './delete';
import { disableAutoupdateAction } from './disable-autoupdate';
import { enableAutoupdateAction } from './enable-autoupdate';
import { updateAction } from './update';
import type { PluginListRow } from '../types';
import type { Action } from '@wordpress/dataviews';

export const getActions = (): Array< Action< PluginListRow > > => {
	return [
		activateAction,
		deactivateAction,
		updateAction,
		enableAutoupdateAction,
		disableAutoupdateAction,
		deleteAction,
	];
};
