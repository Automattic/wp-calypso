/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import { isKeyringConnectionsFetching } from 'state/sharing/keyring/selectors';

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
	( state ) => ( {
		isRequesting: isKeyringConnectionsFetching( state )
	} ),
	{ requestKeyringConnections }
)( QueryKeyringConnections );
