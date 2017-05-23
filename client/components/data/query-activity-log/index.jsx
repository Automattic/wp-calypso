/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getActivityLogData } from 'state/activity-log/actions';
import { isFetchingActivityLog, getRewindStartDate } from 'state/activity-log/selectors';

class QueryActivityLog extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired
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
		if ( props.requestingActivityLog ) {
			return;
		}
		props.getActivityLogData( props.siteId, this.props.startDate );
	}

	render() {
		return null;
	}
}

export const mapDispatchToProps = ( {
	getActivityLogData
} );


export default connect(
	( state, ownProps ) => {
		return {
			requestingActivityLog: isFetchingActivityLog( state, ownProps.siteId ),
			startDate: getRewindStartDate( state, ownProps.siteId )
		};
	},
	mapDispatchToProps
)( QueryActivityLog );
