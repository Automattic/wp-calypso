/**
 * Internal dependencies
 */
import { ANALYTICS_STAT_BUMP } from 'calypso/state/action-types';

export function bumpStat( group, name ) {
	return {
		type: ANALYTICS_STAT_BUMP,
		meta: {
			analytics: [
				{
					type: ANALYTICS_STAT_BUMP,
					payload: { group, name },
				},
			],
		},
	};
}
