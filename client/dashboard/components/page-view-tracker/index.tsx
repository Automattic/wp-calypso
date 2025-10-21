import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';

export function PageViewTracker() {
	const routerState = useRouterState();
	const { recordPageView } = useAnalytics();
	const lastPath = useRef();

	useEffect( () => {
		if ( routerState.status !== 'pending' ) {
			const leafMatch = routerState.matches.at( -1 );
			const basePath = leafMatch?.context?.config?.basePath;
			const path = ( basePath !== '/' ? basePath : '' ) + leafMatch?.routeId;

			if ( path && ( ! lastPath.current || lastPath.current !== path ) ) {
				recordPageView( path, document.title );
				lastPath.current = path;
			}
		}
	}, [ routerState.status, routerState.location.href, recordPageView ] );

	return null;
}
