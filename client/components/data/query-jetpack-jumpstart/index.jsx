/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingJumpstartStatus } from 'state/jetpack-settings/jumpstart/selectors';
import { requestJumpstartStatus } from 'state/jetpack-settings/jumpstart/actions';

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
			requestingJumpstartStatus: isRequestingJumpstartStatus( state, ownProps.siteId )
		};
	},
	{ requestJumpstartStatus }
)( QueryJetpackJumpstart );
