import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';

export default function ComponentViewTracker( { eventName }: { eventName: string } ) {
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		recordTracksEvent( eventName );
	}, [ recordTracksEvent, eventName ] );

	return null;
}
