import { createSelector } from '@wordpress/data';
import { getPluginStatusesByType } from 'calypso/state/plugins/installed/selectors';
import type { AppState } from 'calypso/types';

/**
 * Returns an array of all plugin action statuses(inProgress, completed, error)
 */
export const getPluginActionStatuses = createSelector( ( state: AppState ) => {
	const inProgressStatuses = getPluginStatusesByType( state, 'inProgress' );
	const completedStatuses = getPluginStatusesByType( state, 'completed' );
	const incompletedStatuses = getPluginStatusesByType( state, 'incompleted' );
	const errorStatuses = getPluginStatusesByType( state, 'error' );
	const uptoDateStatuses = getPluginStatusesByType( state, 'up-to-date' );

	return [
		...inProgressStatuses,
		...completedStatuses,
		...errorStatuses,
		...incompletedStatuses,
		...uptoDateStatuses,
	];
} );
