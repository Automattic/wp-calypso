import { useRouter, useRouterState } from '@tanstack/react-router';
import { useEffect, useMemo, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { getNormalizedPath } from '../../app/analytics/super-props';
import { useAppContext } from '../../app/context';

export function PageViewTracker() {
	const router = useRouter();
	const { matches: routerMatches, status: routerStatus, location } = useRouterState();
	const { recordPageView, recordTracksEvent } = useAnalytics();
	const { unifiedAdminPageViewApp: app } = useAppContext();
	const lastPath = useRef< string | null >( null );
	const lastUnifiedPath = useRef< string | null >( null );
	const pathname = location.pathname;

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

	useEffect( () => {
		if ( routerStatus !== 'pending' && app && pathname && lastUnifiedPath.current !== pathname ) {
			recordTracksEvent( 'wpcom_unified_admin_page_view', {
				source: 'msd',
				app,
				path: pathname,
				...( path ? { route: path } : {} ),
			} );
			lastUnifiedPath.current = pathname;
		}
	}, [ app, pathname, path, recordTracksEvent, routerStatus ] );

	return null;
}
