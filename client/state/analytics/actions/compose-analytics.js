/**
 * Internal dependencies
 */
import { ANALYTICS_MULTI_TRACK } from 'state/action-types';

/**
 * External dependencies
 */
import { flatMap, property } from 'lodash';

export default function composeAnalytics( ...analytics ) {
	return {
		type: ANALYTICS_MULTI_TRACK,
		meta: {
			analytics: flatMap( analytics, property( 'meta.analytics' ) ),
		},
	};
}
