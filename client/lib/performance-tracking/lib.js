import { start, stop } from '@automattic/browser-data-collector';
import config from '@automattic/calypso-config';
import {
	getCurrentUserSiteCount,
	getCurrentUserVisibleSiteCount,
	getCurrentUserCountryCode,
	isCurrentUserBootstrapped,
	getCurrentUserLocale,
} from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite, isSingleUserSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { collectTranslationTimings, clearTranslationTimings } from './collectors/translations';
/**
 * This reporter is added to _all_ performance tracking metrics.
 * Be sure to add only metrics that make sense for tracked pages and are always present.
 * @param state redux state
 */
const buildDefaultCollector = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const siteIsSingleUser = isSingleUserSite( state, siteId );
	const siteIsAtomic = isSiteWpcomAtomic( state, siteId );
	const sitesCount = getCurrentUserSiteCount( state );
	const sitesVisibleCount = getCurrentUserVisibleSiteCount( state );
	const userCountryCode = getCurrentUserCountryCode( state );
	const userBootstrapped = isCurrentUserBootstrapped( state );
	const userLocale = getCurrentUserLocale( state );
	const { count: translationsChunksCount, total: translationsChunksDuration } =
		collectTranslationTimings();
	clearTranslationTimings();

	return ( report ) => {
		report.data.set( 'siteId', siteId );
		report.data.set( 'siteIsJetpack', siteIsJetpack );
		report.data.set( 'siteIsSingleUser', siteIsSingleUser );
		report.data.set( 'siteIsAtomic', siteIsAtomic );
		report.data.set( 'sitesCount', sitesCount );
		report.data.set( 'sitesVisibleCount', sitesVisibleCount );
		report.data.set( 'userCountryCode', userCountryCode );
		report.data.set( 'userBootstrapped', userBootstrapped );
		report.data.set( 'userLocale', userLocale );
		report.data.set( 'translationsChunksDuration', translationsChunksDuration );
		report.data.set( 'translationsChunksCount', translationsChunksCount );
	};
};

const buildMetadataCollector = ( metadata = {} ) => {
	return ( reporter ) => {
		Object.entries( metadata ).forEach( ( [ key, value ] ) => reporter.data.set( key, value ) );
	};
};

export const isPerformanceTrackingEnabled = () => {
	return config.isEnabled( 'rum-tracking/logstash' );
};

export const startPerformanceTracking = ( name, { fullPageLoad = false } = {} ) => {
	if ( isPerformanceTrackingEnabled() ) {
		start( name, { fullPageLoad } );
	}
};

export const stopPerformanceTracking = (
	name,
	{ state = {}, metadata = {}, extraCollectors = [] } = {}
) => {
	if ( isPerformanceTrackingEnabled() ) {
		stop( name, {
			collectors: [
				buildDefaultCollector( state ),
				buildMetadataCollector( metadata ),
				...extraCollectors.map( ( collector ) => collector( state, metadata ) ),
			],
		} );
	}
};
