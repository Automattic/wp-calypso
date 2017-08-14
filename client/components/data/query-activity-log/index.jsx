/** @format */
/**
 * External dependencies
 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { activityLogRequest as activityLogRequestAction } from 'state/activity-log/actions';

class QueryActivityLog extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,

		// Unix millisecond timestamps ( moment.valueOf() )
		dateEnd: PropTypes.number,
		dateStart: PropTypes.number,

		// Number of results
		number: PropTypes.number,
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.request( nextProps );
	}

	request( { siteId, dateEnd, dateStart, number } ) {
		if ( siteId ) {
			this.props.activityLogRequest( siteId, {
				dateEnd,
				dateStart,
				number,
			} );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	activityLogRequest: activityLogRequestAction,
} )( QueryActivityLog );
