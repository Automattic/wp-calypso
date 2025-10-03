import { useRouter } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';

export function PageViewTracker() {
	const router = useRouter();
	const { recordPageView } = useAnalytics();
	const lastPath = useRef();

	useEffect( () => {
		return router.subscribe( 'onResolved', () => {
			const leafMatch = router.state.matches.at( -1 );
			const basePath = leafMatch?.context?.config?.basePath;
			const path = ( basePath !== '/' ? basePath : '' ) + leafMatch?.routeId;

			if ( path && ( ! lastPath.current || lastPath.current !== path ) ) {
				recordPageView( path, document.title );
				lastPath.current = path;
			}
		} );
	}, [ router, recordPageView ] );

	return null;
}
