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
import QueryRewindCapabilities from 'components/data/query-rewind-capabilities';
import getRewindCapabilities from 'state/selectors/get-rewind-capabilities';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import getPrimarySiteIsJetpack from 'state/selectors/get-primary-site-is-jetpack';
import getPrimarySiteSlug from 'state/selectors/get-primary-site-slug';
import isSiteAtomic from 'state/selectors/is-site-wpcom-atomic';
import isJetpackSiteMultiSite from 'state/sites/selectors/is-jetpack-site-multi-site';

type Props = {
	primarySiteIsEligible: boolean | null;
	siteCapabilities: string[];
	siteId: number | null;
	siteSlug: string | null;
};

function Home( props: Props ) {
	const { primarySiteIsEligible, siteSlug, siteCapabilities, siteId } = props;

	useEffect( () => {
		const redirectUrl = new URL( '/backup', window.location.href );
		redirectUrl.search = window.location.search;

		// early return while we wait to retrieve information
		if ( primarySiteIsEligible === null || siteCapabilities === undefined ) {
			return;
		} else if ( primarySiteIsEligible && includes( siteCapabilities, 'backup' ) ) {
			redirectUrl.pathname = `/backup/${ siteSlug }`;
		} else if ( primarySiteIsEligible && includes( siteCapabilities, 'scan' ) ) {
			redirectUrl.pathname = `/scan/${ siteSlug }`;
		}

		page.redirect( redirectUrl.toString() );
	}, [ primarySiteIsEligible, siteSlug, siteCapabilities ] );

	return (
		<>
			<QueryRewindCapabilities siteId={ siteId } />
		</>
	);
}

export default connect( ( state ) => {
	const siteId = getPrimarySiteId( state );

	const primarySiteIsEligible = siteId
		? getPrimarySiteIsJetpack( state ) &&
		  ! isSiteAtomic( state, siteId ) &&
		  ! isJetpackSiteMultiSite( state, siteId )
		: null;

	return {
		primarySiteIsEligible,
		siteCapabilities: primarySiteIsEligible ? getRewindCapabilities( state, siteId ) : null,
		siteId: primarySiteIsEligible === false ? null : siteId,
		siteSlug: getPrimarySiteSlug( state ),
	};
} )( Home );
