import {
	FEATURE_SOCIAL_SHARES_1000,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_INSTANT_SEARCH,
	WPCOM_FEATURES_SCAN,
} from '@automattic/calypso-products';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import isBackupPluginActive from 'calypso/state/sites/selectors/is-backup-plugin-active';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import isSearchPluginActive from 'calypso/state/sites/selectors/is-search-plugin-active';
import type { AppState } from 'calypso/types';

export const isSiteEligibleForJetpackCloud = ( state: AppState, siteId: number ) =>
	isSimpleSite( state, siteId ) ||
	( ( isJetpackSite( state, siteId ) ||
		isBackupPluginActive( state, siteId ) ||
		isSearchPluginActive( state, siteId ) ) &&
		( isSiteAtomic( state, siteId ) ||
			( ! isSiteAtomic( state, siteId ) && ! isJetpackSiteMultiSite( state, siteId ) ) ) );

export const getLandingPath = ( state: AppState, siteId: number | null ) => {
	// Landing requires a site ID;
	// if we don't have one, redirect to the site selection page
	if ( ! Number.isInteger( siteId ) ) {
		return '/landing';
	}

	// Send sites that aren't Cloud-eligible back to the site selection page
	const isEligible = isSiteEligibleForJetpackCloud( state, siteId as number );
	if ( ! isEligible ) {
		return '/landing';
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

	const hasSocial = siteHasFeature( state, siteId, FEATURE_SOCIAL_SHARES_1000 );
	if ( hasSocial ) {
		return `/jetpack-social/${ siteSlug }`;
	}

	// For sites with no eligible capabilities, or in situations where
	// we haven't been able to fetch the selected site's features,
	// show the Backup upsell page.
	return `/backup/${ siteSlug }`;
};
