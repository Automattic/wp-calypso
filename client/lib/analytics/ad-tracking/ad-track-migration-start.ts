import { mayWeTrackByTracker } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';

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
		'migration-flow-start',
		{
			send_to: TRACKING_IDS.wpcomGoogleAdsGtag,
		},
	];
	debug( 'adTrackMigrationStart: [Google Ads Gtag]', params );
	window.gtag( ...params );
};

export const recordMigrationStart = (): void => {
	adTrackRedditEvent();
	adTrackGoogleEvent();
};
