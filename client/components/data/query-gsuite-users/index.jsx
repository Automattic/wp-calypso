/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getGSuiteUsers } from 'state/gsuite-users/actions';
import isRequestingGSuiteUsers from 'state/selectors/is-requesting-gsuite-users';

const QueryGSuiteUsers = ( { siteId, request, isRequesting } ) => {
	useEffect( () => {
		if ( ! isRequesting ) {
			request( siteId );
		}
	}, [ siteId, request, isRequesting ] );

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
