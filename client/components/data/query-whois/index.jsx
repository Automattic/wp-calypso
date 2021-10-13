import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestWhois } from 'calypso/state/domains/management/actions';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';

const request = ( domain ) => ( dispatch, getState ) => {
	if ( domain && ! isRequestingWhois( getState(), domain ) ) {
		dispatch( requestWhois( domain ) );
	}
};

function QueryWhois( { domain } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( domain ) );
	}, [ dispatch, domain ] );

	return null;
}

QueryWhois.propTypes = {
	domain: PropTypes.string.isRequired,
};

export default QueryWhois;
