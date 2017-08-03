/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { activityLogRequest as activityLogRequestAction } from 'state/activity-log/actions';

class QueryActivityLog extends Component {
	static propTypes = {
		siteId: PropTypes.number,
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.request( nextProps );
	}

	request( { siteId } ) {
		if ( siteId ) {
			this.props.activityLogRequest( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	activityLogRequest: activityLogRequestAction
} )( QueryActivityLog );
