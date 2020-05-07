/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getTitanUsers } from 'state/titan-users/actions';
import isRequestingTitanUsers from 'state/selectors/is-requesting-titan-users';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingTitanUsers( getState(), siteId ) ) {
		dispatch( getTitanUsers( siteId ) );
	}
};

export default function QueryTitanUsers( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryTitanUsers.propTypes = {
	siteId: PropTypes.number.isRequired,
};
