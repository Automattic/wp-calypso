/**
 * External dependencies
 */
import { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSyncStatus } from './actions';
import { isRequestingSyncStatus, isRequestingResync as isResync } from './selectors';

class QueryMailChimpSyncStatus extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		isRequestingResync: PropTypes.bool.isRequired,
		request: PropTypes.func.isRequired,
	};

	componentDidMount = () => {
		this.createUpdateTimer();
	};

	componentWillUnmount = () => {
		this.destroyUpdateTimer();
	};

	createUpdateTimer = () => {
		if ( this.updateTimer ) {
			return;
		}

		const { isRequesting, isRequestingResync } = this.props;
		const activeRequest = isRequesting || isRequestingResync;

		! activeRequest && this.triggerRequest( this.props );
		// Trigger once each minute
		this.updateTimer = window.setInterval( () => {
			this.triggerRequest( this.props );
		}, 60000 );
	};

	destroyUpdateTimer = () => {
		if ( this.updateTimer ) {
			window.clearInterval( this.updateTimer );
			this.updateTimer = false;
		}
	};

	triggerRequest = ( props ) => {
		if ( ! props.isRequesting && ! props.isRequestingResync && props.siteId ) {
			props.request( props.siteId );
		}
	};

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		siteId,
		isRequesting: isRequestingSyncStatus( state, siteId ),
		isRequestingResync: isResync( state, siteId ),
	} ),
	{ request: requestSyncStatus }
)( QueryMailChimpSyncStatus );
