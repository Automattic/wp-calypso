/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isFetchingConnections as isRequestingConnections } from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections } from 'state/sharing/publicize/actions';

class QueryPublicizeConnections extends Component {
	componentWillMount() {
		if ( ! this.props.requestingConnections && this.props.siteId ) {
			this.props.requestConnections( this.props.siteId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingConnections ||
				! nextProps.siteId ||
				( this.props.siteId === nextProps.siteId ) ) {
			return;
		}

		nextProps.requestConnections( nextProps.siteId );
	}

	render() {
		return null;
	}
}

QueryPublicizeConnections.propTypes = {
	siteId: PropTypes.number,
	requestingConnections: PropTypes.bool,
	requestConnections: PropTypes.func
};

QueryPublicizeConnections.defaultProps = {
	requestConnections: () => {}
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingConnections: isRequestingConnections( state, ownProps.siteId )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestConnections
		}, dispatch );
	}
)( QueryPublicizeConnections );
