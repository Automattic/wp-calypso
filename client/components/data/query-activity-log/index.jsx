/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

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

		// Group
		group: PropTypes.object,
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

	request( { dateEnd, dateStart, number, siteId, group } ) {
		if ( siteId ) {
			this.props.activityLogRequest(
				siteId,
				Object.assign(
					{},
					dateEnd,
					dateStart,
					number,
					group && ! isEmpty( group.includes ) && { group: group.includes }
				)
			);
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { activityLogRequest } )( QueryActivityLog );
