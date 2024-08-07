import { mayWeTrackByTracker } from '../tracker-buckets';
import { TRACKING_IDS, debug } from './constants';

const adTrackRedditEvent = (): void => {
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}
	debug( 'adTrackMigrationStart: [Reddit Ads Tag]' );
	window.rdt( 'track', 'Search' );
};

const adTrackGoogleEvent = (): void => {
	if ( ! mayWeTrackByTracker( 'googleAds' ) ) {
		return;
	}
	const params = [
		'event',
		'conversion',
		{
			send_to: TRACKING_IDS.wpcomGoogleAdsGtagMigrationStart,
		},
	];
	debug( 'adTrackMigrationStart: [Google Ads Gtag]', params );
	window.gtag( ...params );
};

export const recordMigrationStart = (): void => {
	setTimeout( () => {
		adTrackRedditEvent();
		adTrackGoogleEvent();
	}, 0 );
};
