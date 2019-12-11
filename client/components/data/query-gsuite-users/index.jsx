/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getGSuiteUsers } from 'state/gsuite-users/actions';
import isRequestingGSuiteUsers from 'state/selectors/is-requesting-gsuite-users';

const QueryGSuiteUsers = ( { siteId } ) => {
	const dispatch = useDispatch();
	const isRequesting = useSelector( state => isRequestingGSuiteUsers( state, siteId ) );
	const prevIsRequesting = useRef( isRequesting );

	useEffect( () => {
		if ( ! ( isRequesting || prevIsRequesting.current ) ) {
			dispatch( getGSuiteUsers( siteId ) );
		}
		return () => {
			if ( isRequesting ) {
				prevIsRequesting.current = true;
			}
		};
	} );

	return null;
};

QueryGSuiteUsers.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryGSuiteUsers;
