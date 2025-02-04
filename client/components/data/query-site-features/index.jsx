import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteFeatures( getState(), siteId ) ) {
		dispatch( fetchSiteFeatures( siteId ) );
	}
};

const siteIdsHash = ( siteIds ) => {
	siteIds.sort();
	return siteIds.join( '_' );
};

export function useQuerySiteFeatures( siteIds ) {
	const dispatch = useDispatch();
	const hashedSiteIds = siteIdsHash( siteIds );

	useEffect( () => {
		siteIds.forEach( ( siteId ) => dispatch( request( siteId ) ) );
	}, [ dispatch, hashedSiteIds ] );
}

/**
 * Makes an API request to fetch the features for the given array of siteIds.
 * This will make one request per site, so if you have a large number of sites
 * then consider using QueryJetpackSitesFeatures or something similar.
 */
export default function QuerySiteFeatures( { siteIds } ) {
	useQuerySiteFeatures( siteIds );
	return null;
}

QuerySiteFeatures.propTypes = { siteIds: PropTypes.arrayOf( PropTypes.number ) };
