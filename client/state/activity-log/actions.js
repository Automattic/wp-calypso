/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
	REWIND_DEACTIVATE_FAILURE,
	REWIND_DEACTIVATE_REQUEST,
	REWIND_DEACTIVATE_SUCCESS,
	REWIND_RESTORE,
	REWIND_RESTORE_COMPLETED,
	REWIND_RESTORE_UPDATE_ERROR,
	REWIND_STATUS_ERROR,
	REWIND_STATUS_REQUEST,
	REWIND_STATUS_UPDATE,
	ACTIVITY_LOG_FETCH,
	ACTIVITY_LOG_FETCH_FAILED,
	ACTIVITY_LOG_FETCH_SUCCESS,
} from 'state/action-types';
import wpcom from 'lib/wp';

/**
 * Turn the 'rewind' feature on for a site.
 *
 * @param {String|number} siteId site ID
 * @return {Object} action object
 */
export function activateRewind( siteId ) {
	return {
		type: REWIND_ACTIVATE_REQUEST,
		siteId,
	};
}

export function rewindActivateSuccess( siteId ) {
	return {
		type: REWIND_ACTIVATE_SUCCESS,
		siteId,
	};
}

export function rewindActivateFailure( siteId ) {
	return {
		type: REWIND_ACTIVATE_FAILURE,
		siteId,
	};
}

/**
 * Turn the 'rewind' feature off for a site.
 *
 * @param {String|number} siteId site ID
 * @return {Object} action object
 */
export function deactivateRewind( siteId ) {
	return {
		type: REWIND_DEACTIVATE_REQUEST,
		siteId,
	};
}

export function rewindDeactivateSuccess( siteId ) {
	return {
		type: REWIND_DEACTIVATE_SUCCESS,
		siteId,
	};
}

export function rewindDeactivateFailure( siteId ) {
	return {
		type: REWIND_DEACTIVATE_FAILURE,
		siteId,
	};
}

/**
 * Fetch the general status of the 'rewind' feature
 * for a site.
 *
 * @param {String|number} siteId site ID
 * @return {Object} action object
 */
export function getRewindStatus( siteId ) {
	return {
		type: REWIND_STATUS_REQUEST,
		siteId,
	};
}

export function updateRewindStatus( siteId, status ) {
	return {
		type: REWIND_STATUS_UPDATE,
		siteId,
		status,
	};
}

export function rewindStatusError( siteId, error ) {
	return {
		type: REWIND_STATUS_ERROR,
		siteId,
		error,
	};
}

/**
 * Restore a site to the given timestamp.
 *
 * @param {String|number} siteId the site ID
 * @param {number} timestamp Unix timestamp to restore site to
 * @return {Object} action object
 */
export function rewindRestore( siteId, timestamp ) {
	return {
		type: REWIND_RESTORE,
		siteId,
		timestamp,
	};
}

export function rewindCompleteRestore( siteId, timestamp ) {
	return {
		type: REWIND_RESTORE_COMPLETED,
		siteId,
		timestamp,
	};
}

export function rewindRestoreUpdateError( siteId, timestamp, error ) {
	return {
		type: REWIND_RESTORE_UPDATE_ERROR,
		siteId,
		timestamp,
		error,
	};
}

export function getActivityLogData( siteId ) {
	const logs = [
		{
			title: 'Site has not backed up',
			user: null,
			type: 'site_backed_up',
			timestamp: 1485220539222
		},
		{
			title: 'Site has backed up Failed',
			user: null,
			type: 'site_backed_up_failed',
			timestamp: 1485220539222
		},
		{
			title: 'Akismet activated',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'plugin_activated',
			timestamp: 1485220539222
		},
		{
			title: 'Akismet deactivated',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'plugin_deactivated',
			timestamp: 1485220539222
		},
		{
			title: 'Jetpack version 4.6 is available',
			user: null,
			type: 'plugin_needs_update',
			timestamp: 1485220539222
		},
		{
			title: 'Akismet updated to version 3.2',
			user: null,
			type: 'plugin_updated',
			timestamp: 1485220539222
		},
		{
			title: 'This is some really cool post',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'theme_switched',
			timestamp: 1485220539222
		},
		{
			title: 'Twenty Sixteen updated to version 1.0.1',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'theme_updated',
			timestamp: 1485220539222
		},
		{
			title: 'Site updated to Professional Plan, Thank you',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'plan_updated',
			timestamp: 1485220539222
		},
		{
			title: 'Professional Plan Renewed for another month',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'plan_renewed',
			timestamp: 1485220539222
		},
		{
			title: 'Photon was activated',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'activate_jetpack_feature',
			timestamp: 1485220539222
		},
		{
			title: 'Custom CSS was deactivated',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'deactivate_jetpack_feature',
			timestamp: 1485220539222
		},
		{
			title: 'This is some really cool post',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'site_backed_up',
			timestamp: 1485220539222
		},
		{
			title: 'This is some really cool post',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'site_backed_up',
			timestamp: 1485220539222
		},
		{
			title: 'This is some really cool post',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'site_backed_up',
			timestamp: 1485220539222
		},
		{
			title: 'Jetpack updated to 4.5.1',
			subTitle: 'Plugin Update',
			icon: 'plugins',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			time: '4:32pm',
			actionText: 'Undo',
			timestamp: 1483351202400
		},
		{
			title: 'Jetpack updated to 4.5.1',
			subTitle: 'Plugin Activated',
			icon: 'plugins',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			time: '4:32pm',
			actionText: 'Undo',
			timestamp: 1483351202420
		},
		{
			title: 'Post Title',
			subTitle: 'Post Updated',
			icon: 'posts',
			user: { ID: 333, name: 'Jane A', role: 'Admin' },
			time: '10:55am',
			actionText: 'Undo',
			timestamp: 1483264820300
		}
	];

	return ( dispatch ) => {
		dispatch( {
			type: ACTIVITY_LOG_FETCH,
			siteId
		} );

		return wpcom.undocumented().getActivityLog( siteId )
			.then( ( data ) => {
				data = logs; // Get some fake data
				dispatch( {
					type: ACTIVITY_LOG_FETCH_SUCCESS,
					siteId,
					data
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: ACTIVITY_LOG_FETCH_FAILED,
					siteId,
					error: pick( error, [ 'error', 'status', 'message' ] )
				} );
			} );
	};
}
