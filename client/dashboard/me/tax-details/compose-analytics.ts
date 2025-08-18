import { flatMap, property } from 'lodash';

const ANALYTICS_MULTI_TRACK = 'ANALYTICS_MULTI_TRACK';

export function composeAnalytics( ...analytics: object[] ) {
	return {
		type: ANALYTICS_MULTI_TRACK,
		meta: {
			analytics: flatMap( analytics, property( 'meta.analytics' ) ),
		},
	};
}
