import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';
import type { Enhancer } from 'calypso/state/utils';

export default function recordEnhancedTracksEvent(
	eventName: string,
	props: any = {},
	enhancers: Enhancer | Enhancer[] = []
) {
	const recordEvent = withEnhancers( recordTracksEvent, enhancers );
	dispatch( recordEvent( eventName, props ) );
}
