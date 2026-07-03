import { isAdvancedNoticeVisible as isAdvancedNoticeVisibleUtil } from 'calypso/dashboard/utils/hosting-dashboard-enrollment';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';

export const isAdvancedNoticeVisible = ( state: AppState ): boolean => {
	const userId = getCurrentUserId( state ) ?? undefined;
	return isAdvancedNoticeVisibleUtil( userId );
};
