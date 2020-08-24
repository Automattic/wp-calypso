/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteProducts } from 'state/sites/products/selectors';
import { fetchSiteProducts } from 'state/sites/products/actions';

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
