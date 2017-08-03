/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingJetpackJumpstartStatus } from 'state/selectors';
import { requestJumpstartStatus } from 'state/jetpack/jumpstart/actions';

class QueryJetpackJumpstart extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingJumpstartStatus: PropTypes.bool,
		requestJumpstartStatus: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingJumpstartStatus ) {
			return;
		}

		props.requestJumpstartStatus( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingJumpstartStatus: isRequestingJetpackJumpstartStatus( state, ownProps.siteId )
		};
	},
	{ requestJumpstartStatus }
)( QueryJetpackJumpstart );
