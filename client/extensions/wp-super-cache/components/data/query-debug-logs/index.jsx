/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingDebugLogs } from '../../../state/debug/selectors';
import { requestDebugLogs } from '../../../state/debug/actions';

class QueryDebugLogs extends Component {
	componentWillMount() {
		this.requestDebugLogs( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;

		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.requestDebugLogs( nextProps );
	}

	requestDebugLogs( props ) {
		const { requestingDebugLogs, siteId } = props;

		if ( ! requestingDebugLogs && siteId ) {
			props.requestDebugLogs( siteId );
		}
	}

	render() {
		return null;
	}
}

QueryDebugLogs.propTypes = {
	siteId: PropTypes.number,
	requestingDebugLogs: PropTypes.bool,
	requestDebugLogs: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => ( {
		requestingDebugLogs: isRequestingDebugLogs( state, siteId ),
	} ),
	{ requestDebugLogs }
)( QueryDebugLogs );
