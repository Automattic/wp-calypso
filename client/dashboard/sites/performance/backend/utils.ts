import { __, sprintf } from '@wordpress/i18n';
import type { MergedRoute } from './aggregate';
import type { SlowListItem } from './slow-list';

export type Intent = 'success' | 'warning' | 'error';

export interface ThresholdMs {
	good: number;
	warn: number;
}

export const BACKEND_THRESHOLDS_MS: Record<
	'response' | 'db' | 'external' | 'plugins',
	ThresholdMs
> = {
	response: { good: 500, warn: 1500 },
	db: { good: 200, warn: 600 },
	external: { good: 200, warn: 600 },
	plugins: { good: 100, warn: 300 },
};

export function bucketByMs( ms: number, { good, warn }: ThresholdMs ): Intent {
	if ( ms <= good ) {
		return 'success';
	}
	if ( ms <= warn ) {
		return 'warning';
	}
	return 'error';
}

export function buildRequestDetailHref( siteSlug: string, method: string, route: string ): string {
	const params = new URLSearchParams( { method, route } );
	return `/sites/${ siteSlug }/performance/backend/requests?${ params.toString() }`;
}

export function routesToSlowListItems( routes: MergedRoute[], siteSlug: string ): SlowListItem[] {
	return routes.map( ( route ) => ( {
		id: route.id,
		label: `${ route.method } ${ route.route }`,
		avg_ms: route.duration_ms.avg,
		max_ms: route.duration_ms.max,
		href: buildRequestDetailHref( siteSlug, route.method, route.route ),
	} ) );
}

export function formatMs( ms: number ): string {
	if ( ms >= 1000 ) {
		return sprintf(
			/* translators: %s is a number of seconds. */
			__( '%s s' ),
			( ms / 1000 ).toFixed( 2 )
		);
	}
	return sprintf(
		/* translators: %d is a number of milliseconds. */
		__( '%d ms' ),
		ms
	);
}
