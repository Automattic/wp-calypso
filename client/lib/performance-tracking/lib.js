/**
 * External dependencies
 */
import { start, stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import { CONFIG_NAME, AB_NAME, AB_VARIATION_ON } from './const';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'state/sites/selectors';
import isSiteWpcomAtomic from 'state/selectors/is-site-wpcom-atomic';
import {
	getCurrentUserSiteCount,
	getCurrentUserVisibleSiteCount,
} from 'state/current-user/selectors';

/**
 * This reporter is added to _all_ performance tracking metrics.
 * Be sure to add only metrics that make sense for tarcked pages and are always present.
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

	return ( report ) => {
		report.data.set( 'siteIsJetpack', siteIsJetpack );
		report.data.set( 'siteIsSingleUser', siteIsSingleUser );
		report.data.set( 'siteIsAtomic', siteIsAtomic );
		report.data.set( 'sitesCount', sitesCount );
		report.data.set( 'sitesVisibleCount', sitesVisibleCount );
	};
};

const buildMetadataCollector = ( metadata = {} ) => {
	return ( reporter ) => {
		Object.entries( metadata ).forEach( ( [ key, value ] ) => reporter.data.set( key, value ) );
	};
};

const isPerformanceTrackingEnabled = () => {
	const isEnabledForEnvironment = config.isEnabled( CONFIG_NAME );
	const isEnabledForCurrentInteraction = abtest( AB_NAME ) === AB_VARIATION_ON;
	return isEnabledForEnvironment && isEnabledForCurrentInteraction;
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
