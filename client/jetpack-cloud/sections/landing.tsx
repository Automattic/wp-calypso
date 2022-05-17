import {
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_INSTANT_SEARCH,
	WPCOM_FEATURES_SCAN,
} from '@automattic/calypso-products';
import page from 'page';
import { useEffect } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import isBackupPluginActive from 'calypso/state/sites/selectors/is-backup-plugin-active';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import isSearchPluginActive from 'calypso/state/sites/selectors/is-search-plugin-active';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import { AppState } from 'calypso/types';

const siteIsEligible = ( state: AppState, siteId: number | null ) =>
	siteId
		? ( isJetpackSite( state, siteId ) ||
				isBackupPluginActive( state, siteId ) ||
				isSearchPluginActive( state, siteId ) ) &&
		  ! isSiteAtomic( state, siteId ) &&
		  ! isJetpackSiteMultiSite( state, siteId )
		: null;

const Landing: React.FC = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const isEligible = useSelector( ( state ) => siteIsEligible( state, siteId ) );
	const hasBackup = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
	);
	const hasScan = useSelector( ( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ) );
	const hasSearch = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_INSTANT_SEARCH )
	);
	const isFetchingSiteFeatures = useSelector( isRequestingSiteFeatures );

	useEffect( () => {
		// early return while we wait to retrieve information
		if ( isEligible === null || isFetchingSiteFeatures === true ) {
			return;
		}

		// Send sites that aren't Cloud-eligible back to the home page
		if ( ! isEligible ) {
			return page.redirect( '/' );
		}

		const redirectUrl = new URL( window.location.href );

		if ( hasBackup ) {
			redirectUrl.pathname = `/backup/${ siteSlug ?? '' }`;
		} else if ( hasScan ) {
			redirectUrl.pathname = `/scan/${ siteSlug ?? '' }`;
		} else if ( hasSearch ) {
			redirectUrl.pathname = `/jetpack-search/${ siteSlug ?? '' }`;
		} else {
			// For sites with no eligible capabilities, show the Backup upsell page.
			redirectUrl.pathname = `/backup/${ siteSlug ?? '' }`;
		}

		return page.redirect( redirectUrl.toString() );
	}, [ hasBackup, hasScan, hasSearch, isEligible, isFetchingSiteFeatures, siteSlug ] );

	return (
		<>
			<QuerySiteFeatures siteIds={ [ siteId ] } />
		</>
	);
};

export default Landing;
