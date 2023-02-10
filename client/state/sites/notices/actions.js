import { UPDATE_STATS_NOTICE_STATUS_DIRECT } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/notices';

/**
 * Dismisses a jitm directly
 *
 * @param {string} id The id of the jitm to dismiss
 * @param {string} featureClass The feature class of the jitm to dismiss
 * @returns {Object} The dismiss action
 */
export const updateStatsNoticeStatusDirect = (
	siteId,
	id,
	status = 'dismissed',
	postponed_for = 0
) => {
	return {
		type: UPDATE_STATS_NOTICE_STATUS_DIRECT,
		siteId,
		id,
		status,
		postponed_for,
	};
};
