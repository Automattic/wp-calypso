import { useRouter, useRouterState } from '@tanstack/react-router';
import { useEffect, useMemo, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { getNormalizedPath } from '../../app/analytics/super-props';

export function PageViewTracker() {
	const router = useRouter();
	const { matches: routerMatches, status: routerStatus } = useRouterState();
	const { recordPageView } = useAnalytics();
	const lastPath = useRef< string | null >( null );

	const path = useMemo(
		() => getNormalizedPath( routerMatches, router.basepath ),
		[ routerMatches, router.basepath ]
	);

	useEffect( () => {
		if ( routerStatus !== 'pending' && path && lastPath.current !== path ) {
			recordPageView( path, document.title );
			lastPath.current = path;
		}
	}, [ path, recordPageView, routerStatus ] );

	return null;
}
