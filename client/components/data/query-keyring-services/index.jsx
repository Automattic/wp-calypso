/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isKeyringServicesFetching } from 'state/sharing/services/selectors';
import { requestKeyringServices } from 'state/sharing/services/actions';

class QueryKeyringServices extends Component {
	UNSAFE_componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.requestKeyringServices();
		}
	}

	render() {
		return null;
	}
}

QueryKeyringServices.propTypes = {
	isRequesting: PropTypes.bool,
	requestKeyringServices: PropTypes.func,
};

export default connect(
	( state ) => ( {
		isRequesting: isKeyringServicesFetching( state ),
	} ),
	{ requestKeyringServices }
)( QueryKeyringServices );
