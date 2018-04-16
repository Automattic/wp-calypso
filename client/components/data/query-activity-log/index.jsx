/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { activityLogRequest } from 'state/activity-log/actions';

class QueryActivityLog extends Component {
	static propTypes = {
		siteId: PropTypes.number,

		// Unix millisecond timestamps ( moment.valueOf() )
		dateEnd: PropTypes.number,
		dateStart: PropTypes.number,

		// Number of results
		number: PropTypes.number,
	};

	static defaultProps = {
		number: 20,
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.request( nextProps );
	}

	request( { dateEnd, dateStart, number, siteId } ) {
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

export default connect( null, { activityLogRequest } )( QueryActivityLog );
