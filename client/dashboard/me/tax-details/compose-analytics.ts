const ANALYTICS_MULTI_TRACK = 'ANALYTICS_MULTI_TRACK';

interface ComposedAnalyticsMeta {
	analytics: object[];
}

interface ComposedAnalytics {
	type: string;
	meta: ComposedAnalyticsMeta;
}

export function composeAnalytics( ...analytics: ComposedAnalytics[] ) {
	return {
		type: ANALYTICS_MULTI_TRACK,
		meta: {
			analytics: analytics.flatMap( ( o: ComposedAnalytics ) => o?.meta?.analytics ) as object[],
		},
	};
}
