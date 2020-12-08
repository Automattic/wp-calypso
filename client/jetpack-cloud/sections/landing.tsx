/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { includes } from 'lodash';
import page from 'page';
import React, { useEffect } from 'react';

/**
 * Internal dependencies
 */
import QueryRewindCapabilities from 'calypso/components/data/query-rewind-capabilities';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';

type Props = {
	siteIsEligible: boolean | null;
	siteCapabilities: string[];
	siteId: number | null;
	siteSlug: string | null;
};

function Landing( props: Props ) {
	const { siteIsEligible, siteSlug, siteCapabilities, siteId } = props;

	useEffect( () => {
		// early return while we wait to retrieve information
		if ( siteIsEligible === null || siteCapabilities === undefined ) {
			return;
		}

		// Send sites that aren't Cloud-eligible back to the home page
		if ( ! siteIsEligible ) {
			return page.redirect( '/' );
		}

		const redirectUrl = new URL( window.location.href );

		// For sites with Scan but not Backup, redirect to Scan
		if ( includes( siteCapabilities, 'scan' ) && ! includes( siteCapabilities, 'backup' ) ) {
			redirectUrl.pathname = `/scan/${ siteSlug ?? '' }`;
			return page.redirect( redirectUrl.toString() );
		}

		// For sites with Backup, show the Backup page;
		// for sites with neither Backup nor Scan, show the Backup upsell page
		redirectUrl.pathname = `/backup/${ siteSlug ?? '' }`;
		page.redirect( redirectUrl.toString() );
	}, [ siteIsEligible, siteSlug, siteCapabilities ] );

	return <QueryRewindCapabilities siteId={ siteId } />;
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	const siteIsEligible = siteId
		? isJetpackSite( state, siteId ) &&
		  ! isSiteAtomic( state, siteId ) &&
		  ! isJetpackSiteMultiSite( state, siteId )
		: null;

	return {
		siteIsEligible,
		siteCapabilities: siteIsEligible ? getRewindCapabilities( state, siteId ) : null,
		siteId: siteIsEligible === false ? null : siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( Landing );
