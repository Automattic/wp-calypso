import { buildRailcarEventProps, isRailcarEligibleForEvent } from 'calypso/reader/stats';
import { getReaderFollowsCount } from 'calypso/state/reader/follows/selectors';
import { dispatchReaderTracksEvent } from './analytics.utils';

/**
 * Record a tracks event with additional reader-specific properties.
 * Automatically records a railcar event if the event is eligible for a railcar event.
 * @returns The action object to dispatch.
 */
export const recordReaderTracksEvent =
	( name, properties, { pathnameOverride, post, railcar: railcarOverride } = {} ) =>
	( dispatch, getState ) => {
		const followsCount = getReaderFollowsCount( getState() );
		const railcar = railcarOverride || post?.railcar;

		if ( isRailcarEligibleForEvent( name ) && railcar ) {
			const railcarEventProps = buildRailcarEventProps( name, railcar, properties );
			dispatchReaderTracksEvent( dispatch, 'calypso_traintracks_interact', railcarEventProps, {
				pathnameOverride,
				post,
			} );
		}

		dispatchReaderTracksEvent(
			dispatch,
			name,
			{ ...properties, subscription_count: followsCount },
			{ pathnameOverride, post }
		);
	};
