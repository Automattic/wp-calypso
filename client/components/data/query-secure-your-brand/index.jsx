/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSecureYourBrand } from 'state/secure-your-brand/selectors';
import { getSecureYourBrand } from 'state/secure-your-brand/actions';

const request = ( domain ) => ( dispatch, getState ) => {
	if ( ! isRequestingSecureYourBrand( getState() ) ) {
		dispatch( getSecureYourBrand( domain ) );
	}
};

export default function QuerySecureYourBrand( { domain } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( domain ) );
	}, [ dispatch, domain ] );

	return null;
}

QuerySecureYourBrand.propTypes = { domain: PropTypes.string };
