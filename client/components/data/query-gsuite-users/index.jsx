/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getGSuiteUsers } from 'state/gsuite-users/actions';
import isRequestingGSuiteUsers from 'state/selectors/is-requesting-gsuite-users';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingGSuiteUsers( getState(), siteId ) ) {
		dispatch( getGSuiteUsers( siteId ) );
	}
};

export default function QueryGSuiteUsers( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryGSuiteUsers.propTypes = {
	siteId: PropTypes.number.isRequired,
};
