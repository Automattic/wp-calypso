/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import page from 'page';
import React, { useEffect } from 'react';

/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import QueryRewindCapabilities from 'calypso/components/data/query-rewind-capabilities';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';

const siteIsEligible = ( state: AppState, siteId: number | null ) =>
	siteId
		? isJetpackSite( state, siteId ) &&
		  ! isSiteAtomic( state, siteId ) &&
		  ! isJetpackSiteMultiSite( state, siteId )
		: null;

const Landing: React.FC = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const isEligible = useSelector( ( state ) => siteIsEligible( state, siteId ) );
	const capabilities = useSelector( ( state ) => getRewindCapabilities( state, siteId ) );

	useEffect( () => {
		// early return while we wait to retrieve information
		if ( isEligible === null || capabilities === undefined ) {
			return;
		}

		// Send sites that aren't Cloud-eligible back to the home page
		if ( ! isEligible ) {
			return page.redirect( '/' );
		}

		const hasBackup = capabilities.includes( 'backup' );
		const hasScan = capabilities.includes( 'scan' );

		const redirectUrl = new URL( window.location.href );

		// For sites with Scan but not Backup, redirect to Scan
		if ( hasScan && ! hasBackup ) {
			redirectUrl.pathname = `/scan/${ siteSlug ?? '' }`;
			return page.redirect( redirectUrl.toString() );
		}

		// For sites with Backup, show the Backup page;
		// for sites with neither Backup nor Scan, show the Backup upsell page
		redirectUrl.pathname = `/backup/${ siteSlug ?? '' }`;
		page.redirect( redirectUrl.toString() );
	}, [ isEligible, siteSlug, capabilities ] );

	return <QueryRewindCapabilities siteId={ siteId } />;
};

export default Landing;
