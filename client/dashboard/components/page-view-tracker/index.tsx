import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';

export function PageViewTracker() {
	const router = useRouter();
	const { recordPageView } = useAnalytics();

	useEffect( () => {
		return router.subscribe( 'onResolved', () => {
			const leafMatch = router.state.matches.at( -1 );
			const path = leafMatch?.context?.config?.basePath + leafMatch?.routeId;

			if ( path ) {
				recordPageView( path, document.title );
			}
		} );
	}, [ router, recordPageView ] );

	return null;
}
