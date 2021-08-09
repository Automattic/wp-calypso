import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSiteProducts } from 'calypso/state/sites/products/actions';
import { isRequestingSiteProducts } from 'calypso/state/sites/products/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteProducts( getState(), siteId ) ) {
		dispatch( fetchSiteProducts( siteId ) );
	}
};

export default function QuerySiteProducts( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteProducts.propTypes = { siteId: PropTypes.number };
