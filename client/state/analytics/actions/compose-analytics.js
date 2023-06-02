import { flatMap, property } from 'lodash';
import { ANALYTICS_MULTI_TRACK } from 'calypso/state/action-types';

export function composeAnalytics( ...analytics ) {
	return {
		type: ANALYTICS_MULTI_TRACK,
		meta: {
			analytics: flatMap( analytics, property( 'meta.analytics' ) ),
		},
	};
}
