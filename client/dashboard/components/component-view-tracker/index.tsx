import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';

export default function ComponentViewTracker( {
	eventName,
	properties,
}: {
	eventName: string;
	properties?: Record< string, unknown >;
} ) {
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		recordTracksEvent( eventName, properties );
	}, [ recordTracksEvent, eventName, properties ] );

	return null;
}
