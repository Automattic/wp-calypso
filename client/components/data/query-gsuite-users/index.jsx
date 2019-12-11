/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getGSuiteUsers } from 'state/gsuite-users/actions';
import isRequestingGSuiteUsers from 'state/selectors/is-requesting-gsuite-users';

const QueryGSuiteUsers = ( { siteId, request, isRequesting } ) => {
	const prevIsRequestingRef = useRef();
	const [ loaded, setLoaded ] = useState( false );
	useEffect( () => {
		prevIsRequestingRef.current = isRequesting;
		if ( ! isRequesting ) {
			request( siteId );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId, request, loaded ] );
	if ( prevIsRequestingRef.current && ! isRequesting ) {
		setLoaded( true );
	}
	return null;
};

QueryGSuiteUsers.propTypes = {
	isRequesting: PropTypes.bool.isRequired,
	siteId: PropTypes.number.isRequired,
	request: PropTypes.func.isRequired,
};

export default connect(
	( state, ownProps ) => ( {
		isRequesting: isRequestingGSuiteUsers( state, ownProps.siteId ),
	} ),
	{ request: getGSuiteUsers }
)( QueryGSuiteUsers );
