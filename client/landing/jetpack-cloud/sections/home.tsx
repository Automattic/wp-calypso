/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import QueryRewindCapabilities from 'components/data/query-rewind-capabilities';
import getRewindCapabilities from 'state/selectors/get-rewind-capabilities';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import getPrimarySiteIsJetpack from 'state/selectors/get-primary-site-is-jetpack';
import config from 'config';
import getPrimarySiteSlug from 'state/selectors/get-primary-site-slug';

type Props = {
	siteId?: number | null;
	siteSlug?: string | null;
	siteCapabilities?: string[];
};

function Home( props: Props ) {
	const { siteId, siteSlug, siteCapabilities } = props;

	useEffect( () => {
		const redirectUrl = new URL( '/error', window.location.href );
		redirectUrl.search = window.location.search;

		if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
			redirectUrl.pathname = '/backups';
		} else if ( config.isEnabled( 'jetpack-cloud/scan' ) ) {
			redirectUrl.pathname = '/scan';
		}
		if ( ! siteId ) {
			return page.redirect( redirectUrl.toString() );
		}

		if ( ! siteSlug || ! Array.isArray( siteCapabilities ) ) {
			return;
		}

		// From capabilities, build proper URL.
		if ( config.isEnabled( 'jetpack-cloud/backups' ) && siteCapabilities.includes( 'backup' ) ) {
			redirectUrl.pathname = `/backups/${ siteSlug }`;
		} else if ( config.isEnabled( 'jetpack-cloud/scan' ) && siteCapabilities.includes( 'scan' ) ) {
			redirectUrl.pathname = `/scan/${ siteSlug }`;
		}

		page.redirect( redirectUrl.toString() );
	}, [ siteId, siteSlug, siteCapabilities ] );

	return (
		<>
			<QueryRewindCapabilities siteId={ siteId } />
		</>
	);
}

export default connect( ( state ) => {
	if ( ! getPrimarySiteIsJetpack( state ) ) {
		return {
			siteId: null,
		};
	}
	const siteId = getPrimarySiteId( state );
	const siteSlug = getPrimarySiteSlug( state );
	const siteCapabilities = getRewindCapabilities( state, siteId );

	return {
		siteId,
		siteSlug,
		siteCapabilities,
	};
} )( Home );
