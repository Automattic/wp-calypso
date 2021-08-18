/**
 * Internal dependencies
 */
import type { DisplayRules } from 'calypso/state/activity-log/display-rules/types';

type ApiResponse = {
	policies: {
		activity_log_limit_days: number;
	} | null;
};

const fromApi = ( { policies }: ApiResponse ): DisplayRules => ( {
	visibleDays: policies?.activity_log_limit_days,
} );

export default fromApi;
