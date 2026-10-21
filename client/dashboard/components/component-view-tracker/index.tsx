import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';

export default function ComponentViewTracker( {
	eventName,
	properties,
}: {
	eventName: string;
	properties?: Record< string, unknown >;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const hasTracked = useRef( false );

	useEffect( () => {
		if ( hasTracked.current ) {
			return;
		}
		hasTracked.current = true;
		recordTracksEvent( eventName, properties );
	}, [ recordTracksEvent, eventName, JSON.stringify( properties ) ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
