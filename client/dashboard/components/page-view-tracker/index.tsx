import { useMatch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';

export function PageViewTracker( { title }: { title: string } ) {
	const { recordPageView } = useAnalytics();
	const path = useMatch( {
		strict: false,
		select: ( match ): string => match.context.config.basePath + match.routeId,
	} );

	useEffect( () => {
		recordPageView( path, title );
	}, [ recordPageView, path, title ] );

	return null;
}
