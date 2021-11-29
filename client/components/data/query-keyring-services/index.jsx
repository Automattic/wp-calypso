import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestKeyringServices } from 'calypso/state/sharing/services/actions';
import { isKeyringServicesFetching } from 'calypso/state/sharing/services/selectors';

class QueryKeyringServices extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
