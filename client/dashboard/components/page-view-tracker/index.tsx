import { useRouter } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { getNormalizedPath } from '../../app/analytics/super-props';

export function PageViewTracker() {
	const router = useRouter();
	const { recordPageView } = useAnalytics();
	const lastPath = useRef< string | null >( null );

	useEffect( () => {
		if ( router.state.status !== 'pending' ) {
			const path = getNormalizedPath( router );

			if ( path && ( ! lastPath.current || lastPath.current !== path ) ) {
				recordPageView( path, document.title );
				lastPath.current = path;
			}
		}
	}, [ router, router.state.status, router.state.location.href, recordPageView ] );

	return null;
}
