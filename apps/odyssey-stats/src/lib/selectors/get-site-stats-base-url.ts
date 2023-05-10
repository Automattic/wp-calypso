import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import config from '../config-api';
import getOdysseyStatsBaseUrl from './get-odyssey-stats-base-url';

const getSiteStatsBaseUrl = ( siteId: number ): string =>
	isSiteAutomatedTransfer( config( 'intial_state' ), siteId )
		? 'https://wordpress.com'
		: `${ getOdysseyStatsBaseUrl() }#!`;

export default getSiteStatsBaseUrl;
