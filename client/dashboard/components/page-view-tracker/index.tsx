import { useMatches } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';

export function PageViewTracker() {
	const { recordPageView } = useAnalytics();
	const { path, title } = useMatches( {
		select: ( matches ) => {
			const leafMatch = matches.at( -1 );
			return {
				path: ( leafMatch?.context?.config?.basePath + leafMatch?.routeId ) as string | undefined,
				title: leafMatch?.staticData.analytics_title,
			};
		},
		structuralSharing: true,
	} );

	useEffect( () => {
		if ( path && title ) {
			recordPageView( path, title );
		}
	}, [ recordPageView, path, title ] );

	return null;
}
