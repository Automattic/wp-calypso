/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingGSuiteUsers from 'state/selectors/is-requesting-gsuite-users';
import { getGSuiteUsers } from 'state/gsuite-users/actions';

const QueryGSuiteUsers = ( { siteId, request, isRequesting } ) => {
	useEffect(() => {
		if ( ! isRequesting ) {
			request( siteId );
		}
	}, [ siteId, request, isRequesting ]);
	return null;
};

QueryGSuiteUsers.propTypes = {
	siteId: PropTypes.number.isRequired,
	request: PropTypes.func.isRequired,
	isRequesting: PropTypes.bool.isRequired,
};

export default connect(
	( state, ownProps ) => ( {
		isRequesting: isRequestingGSuiteUsers( state, ownProps.siteid ),
	} ),
	{ request: getGSuiteUsers }
)( QueryGSuiteUsers );
