import { UPDATE_STATS_NOTICE_STATUS_DIRECT } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/notices';

/**
 * Dismisses a stats notice directly to Jetpack site.
 *
 * @param {number} siteId The id of the site
 * @param {string} id The id of the notice to dismiss
 * @param {string} status The status
 * @param {number} postponed_for The number of seconds to postpone the notice
 *
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
