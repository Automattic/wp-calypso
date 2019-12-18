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

const request = siteId => ( dispatch, getState ) => {
	const isRequesting = isRequestingGSuiteUsers( getState(), siteId );
	if ( ! isRequesting ) {
		dispatch( getGSuiteUsers( siteId ) );
	}
};

const QueryGSuiteUsers = ( { siteId } ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ siteId, dispatch ] );

	return null;
};

QueryGSuiteUsers.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryGSuiteUsers;
