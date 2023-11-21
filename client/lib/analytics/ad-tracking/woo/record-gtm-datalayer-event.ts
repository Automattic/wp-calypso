import { mayWeTrackByTracker } from '../../tracker-buckets';
import { debug, TRACKING_IDS } from '../constants';
import { initGTMContainer, loadGTMContainer } from '../gtm-container';

/**
 * Sends a step event to Google Tag Manager for the woo express stepper flow.
 * @param {string} stepName
 * @returns {void}
 */
export default function recordGTMDatalayerEvent( stepName = '' ) {
	// We ensure that we can track with GTM
	if ( ! mayWeTrackByTracker( 'googleTagManager' ) ) {
		return;
	}
	loadGTMContainer( TRACKING_IDS.wooGoogleTagManagerId )
		.then( () => initGTMContainer() )
		.then( () => {
			debug(
				`recordGTMDatalayerEvent: Initialized GTM container ${ TRACKING_IDS.wooGoogleTagManagerId }`
			);

			const trackEventMeta = {
				event: 'visitor interaction',
				interaction_name: stepName,
			};

			window.dataLayer.push( trackEventMeta );

			debug( `recordGTMDatalayerEvent: Record Woo Express Stepper Event`, trackEventMeta );
		} )
		.catch( ( error ) => {
			debug( 'recordGTMDatalayerEvent: Error loading GTM container', error );
		} );
}
