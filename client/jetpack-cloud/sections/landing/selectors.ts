import {
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_INSTANT_SEARCH,
	WPCOM_FEATURES_SCAN,
} from '@automattic/calypso-products';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import isBackupPluginActive from 'calypso/state/sites/selectors/is-backup-plugin-active';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import isSearchPluginActive from 'calypso/state/sites/selectors/is-search-plugin-active';
import type { AppState } from 'calypso/types';

export const isSiteEligibleForJetpackCloud = ( state: AppState, siteId: number ) =>
	( isJetpackSite( state, siteId ) ||
		isBackupPluginActive( state, siteId ) ||
		isSearchPluginActive( state, siteId ) ) &&
	! isSiteAtomic( state, siteId ) &&
	! isJetpackSiteMultiSite( state, siteId );

export const getLandingPath = ( state: AppState, siteId: number ) => {
	// If we don't know about the given site's features,
	// we can't make an informed decision about where visitors
	// should land when they enter Jetpack Cloud
	const siteFeatures = getFeaturesBySiteId( state, siteId );
	if ( ! siteFeatures ) {
		return undefined;
	}

	// Send sites that aren't Cloud-eligible back to the home page
	const isEligible = isSiteEligibleForJetpackCloud( state, siteId );
	if ( ! isEligible ) {
		return '/';
	}

	const siteSlug = getSiteSlug( state, siteId );

	const hasBackup = siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS );
	if ( hasBackup ) {
		return `/backup/${ siteSlug }`;
	}

	const hasScan = siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN );
	if ( hasScan ) {
		return `/scan/${ siteSlug }`;
	}

	const hasSearch = siteHasFeature( state, siteId, WPCOM_FEATURES_INSTANT_SEARCH );
	if ( hasSearch ) {
		return `/jetpack-search/${ siteSlug }`;
	}

	// For sites with no eligible capabilities, or in situations where
	// we haven't been able to fetch the selected site's features,
	// show the Backup upsell page.
	return `/backup/${ siteSlug }`;
};
