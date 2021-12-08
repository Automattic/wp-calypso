import debugFactory from 'debug';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordCompositeCheckoutErrorDuringAnalytics } from './lib/analytics';

const debug = debugFactory( 'calypso:composite-checkout:record-analytics' );

/**
 * NOTE: This file should not be necessary and should slowly be reduced to
 * nothing. Please try not to add anything new here.
 *
 * If you need to record an event, record it directly rather than sending an
 * action to this handler.
 */
export default function createAnalyticsEventHandler( reduxDispatch ) {
	return function recordEvent( action ) {
		try {
			debug( 'heard checkout event', action );
			switch ( action.type ) {
				default:
					debug( 'unknown checkout event', action );
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_unknown_event', {
							error_type: String( action.type ),
						} )
					);
			}
		} catch ( err ) {
			reduxDispatch(
				recordCompositeCheckoutErrorDuringAnalytics( {
					errorObject: err,
					failureDescription: String( action?.type ) + ':' + String( action?.payload ),
				} )
			);
		}
	};
}
