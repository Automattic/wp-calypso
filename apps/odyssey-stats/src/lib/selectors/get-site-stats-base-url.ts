import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import config from '../config-api';
import getOdysseyStatsBaseUrl from './get-odyssey-stats-base-url';

const getSiteStatsBaseUrl = ( siteId: number ): string =>
	isSiteWpcomAtomic( config( 'intial_state' ), siteId )
		? 'https://wordpress.com'
		: `${ getOdysseyStatsBaseUrl() }#!`;

export default getSiteStatsBaseUrl;
