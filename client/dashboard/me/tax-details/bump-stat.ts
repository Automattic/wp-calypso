export const ANALYTICS_STAT_BUMP = 'ANALYTICS_STAT_BUMP';

export function bumpStat( group: string, name: string ) {
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
