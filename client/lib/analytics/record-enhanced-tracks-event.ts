import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';
import type { Enhancer } from 'calypso/state/utils/with-enhancers';

/**
 * Record a tracks event with additional common properties using enhancers.
 * @see client/state/analytics/README.md
 */
export default function recordEnhancedTracksEvent(
	eventName: string,
	eventData: any = {},
	enhancers: Enhancer | Enhancer[] = []
) {
	const recordEvent = withEnhancers( recordTracksEvent, enhancers );
	dispatch( recordEvent( eventName, eventData ) );
}
