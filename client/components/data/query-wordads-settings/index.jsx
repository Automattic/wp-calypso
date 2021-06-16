/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestWordadsSettings } from 'calypso/state/wordads/settings/actions';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { requestJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import isRequestingJetpackSettings from 'calypso/state/selectors/is-requesting-jetpack-settings';

export default function QueryWordadsSettings( { siteId } ) {
	const dispatch = useDispatch();
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isFetchingSettings = useSelector( ( state ) =>
		isRequestingJetpackSettings( state, siteId, null )
	);

	React.useEffect( () => {
		dispatch( requestWordadsSettings( siteId ) );

		// WordAds settings on Jetpack sites are not available on the WordAds API endpoint, so we
		// fetch them from the site settings endpoints.
		if ( isJetpack && ! isFetchingSettings ) {
			dispatch( requestJetpackSettings( siteId, null ) );
		}
	}, [ dispatch, siteId, isJetpack ] );

	return null;
}
