import { getPluginStatusesByType } from 'calypso/state/plugins/installed/selectors';
import type { AppState } from 'calypso/types';

/**
 * Returns an array of all plugin action statuses(inProgress, completed, error)
 */
export const getPluginActionStatuses = ( state: AppState ) => {
	const inProgressStatuses = getPluginStatusesByType( state, 'inProgress' );
	const completedStatuses = getPluginStatusesByType( state, 'completed' );
	const errorStatuses = getPluginStatusesByType( state, 'error' );

	return [ ...inProgressStatuses, ...completedStatuses, ...errorStatuses ];
};
