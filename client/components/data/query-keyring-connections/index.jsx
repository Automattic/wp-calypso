/** @format */
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isKeyringConnectionsFetching } from 'state/sharing/keyring/selectors';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';

class QueryKeyringConnections extends Component {
	static propTypes = {
		isRequesting: PropTypes.bool,
		requestKeyringConnections: PropTypes.func,
	};

	componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.requestKeyringConnections();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		isRequesting: isKeyringConnectionsFetching( state ),
	} ),
	{ requestKeyringConnections }
)( QueryKeyringConnections );
