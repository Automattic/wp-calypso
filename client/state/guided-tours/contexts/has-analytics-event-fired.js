/**
 * Internal dependencies
 */
import { ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import { getLastAction } from 'calypso/state/ui/action-log/selectors';

/**
 * Returns a selector that tests whether a certain analytics event has been
 * fired.
 *
 * @see client/state/analytics
 *
 * @param {string} eventName Name of analytics event
 * @returns {Function} Selector function
 */
export const hasAnalyticsEventFired = ( eventName ) => ( state ) => {
	const last = getLastAction( state );
	return (
		last.type === ANALYTICS_EVENT_RECORD &&
		last.meta.analytics.some( ( record ) => record.payload.name === eventName )
	);
};
