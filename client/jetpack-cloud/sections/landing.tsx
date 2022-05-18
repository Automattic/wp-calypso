import page from 'page';
import { useEffect } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import QueryRewindCapabilities from 'calypso/components/data/query-rewind-capabilities';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import {
	isFetchingSitePurchases as isFetchingSitePurchasesSelector,
	siteHasSearchProductPurchase,
} from 'calypso/state/purchases/selectors';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
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
	const capabilities = useSelector( ( state ) => getRewindCapabilities( state, siteId ) );
	const hasSearch = useSelector( ( state ) => siteHasSearchProductPurchase( state, siteId ) );
	const isFetchingSitePurchases = useSelector( ( state ) =>
		isFetchingSitePurchasesSelector( state )
	);

	useEffect( () => {
		// early return while we wait to retrieve information
		if ( isEligible === null || capabilities === undefined || isFetchingSitePurchases === true ) {
			return;
		}

		// Send sites that aren't Cloud-eligible back to the home page
		if ( ! isEligible ) {
			return page.redirect( '/' );
		}

		const hasBackup = capabilities.includes( 'backup' );
		const hasScan = capabilities.includes( 'scan' );

		const redirectUrl = new URL( window.location.href );

		if ( hasBackup ) {
			redirectUrl.pathname = `/backup/${ siteSlug ?? '' }`;
		} else if ( hasScan ) {
			redirectUrl.pathname = `/scan/${ siteSlug ?? '' }`;
		} else if ( hasSearch ) {
			redirectUrl.pathname = `/jetpack-search/${ siteSlug ?? '' }`;
		} else {
			// For sites with no eligibile capabilities, show the Backup upsell page.
			redirectUrl.pathname = `/backup/${ siteSlug ?? '' }`;
		}

		return page.redirect( redirectUrl.toString() );
	}, [ capabilities, hasSearch, isEligible, isFetchingSitePurchases, siteSlug ] );

	return (
		<>
			<QueryRewindCapabilities siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
		</>
	);
};

export default Landing;
