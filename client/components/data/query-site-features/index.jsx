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
export default function QuerySiteFeatures( { siteIds } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		console.log( 'Querying Site Features', siteIds );
		siteIds.forEach( ( siteId ) => dispatch( request( siteId ) ) );
	}, [ dispatch, siteIdsHash( siteIds ) ] );

	return null;
}

QuerySiteFeatures.propTypes = { siteIds: PropTypes.arrayOf( PropTypes.number ) };
