import { ANALYTICS_MULTI_TRACK } from 'calypso/state/action-types';

export function composeAnalytics( ...analytics ) {
	return {
		type: ANALYTICS_MULTI_TRACK,
		meta: {
			analytics: analytics.flatMap( ( action ) => action.meta.analytics ),
		},
	};
}
