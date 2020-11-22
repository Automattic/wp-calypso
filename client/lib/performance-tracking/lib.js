/**
 * External dependencies
 */
import { start, stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'calypso/state/sites/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import {
	getCurrentUserSiteCount,
	getCurrentUserVisibleSiteCount,
	getCurrentUserCountryCode,
	isCurrentUserBootstrapped,
} from 'calypso/state/current-user/selectors';

/**
 * This reporter is added to _all_ performance tracking metrics.
 * Be sure to add only metrics that make sense for tracked pages and are always present.
 *
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

	return ( report ) => {
		report.data.set( 'siteId', siteId );
		report.data.set( 'siteIsJetpack', siteIsJetpack );
		report.data.set( 'siteIsSingleUser', siteIsSingleUser );
		report.data.set( 'siteIsAtomic', siteIsAtomic );
		report.data.set( 'sitesCount', sitesCount );
		report.data.set( 'sitesVisibleCount', sitesVisibleCount );
		report.data.set( 'userCountryCode', userCountryCode );
		report.data.set( 'userBootstrapped', userBootstrapped );
	};
};

const buildMetadataCollector = ( metadata = {} ) => {
	return ( reporter ) => {
		Object.entries( metadata ).forEach( ( [ key, value ] ) => reporter.data.set( key, value ) );
	};
};

const isPerformanceTrackingEnabled = () => {
	return config.isEnabled( 'rum-tracking/logstash' );
};

export const startPerformanceTracking = ( name, { fullPageLoad = false } = {} ) => {
	if ( isPerformanceTrackingEnabled() ) {
		start( name, { fullPageLoad } );
	}
};

export const stopPerformanceTracking = ( name, { state = {}, metadata = {} } = {} ) => {
	if ( isPerformanceTrackingEnabled() ) {
		stop( name, {
			collectors: [ buildDefaultCollector( state ), buildMetadataCollector( metadata ) ],
		} );
	}
};
