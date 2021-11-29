import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { isKeyringConnectionsFetching } from 'calypso/state/sharing/keyring/selectors';

class QueryKeyringConnections extends Component {
	static propTypes = {
		forceRefresh: PropTypes.bool,
		isRequesting: PropTypes.bool,
		requestKeyringConnections: PropTypes.func,
	};

	static defaultProps = {
		forceRefresh: false,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.requestKeyringConnections( this.props.forceRefresh );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		isRequesting: isKeyringConnectionsFetching( state ),
	} ),
	{ requestKeyringConnections }
)( QueryKeyringConnections );
