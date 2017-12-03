/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Interval, { EVERY_TEN_SECONDS } from 'lib/interval';
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

	static defaultProps = {
		number: 20,
	};

	componentWillMount() {
		this.request();
	}

	componentDidUpdate() {
		this.request();
	}

	request = () => {
		const { dateEnd, dateStart, number, siteId } = this.props;

		if ( siteId ) {
			this.props.activityLogRequest( siteId, { dateEnd, dateStart, number } );
		}
	};

	render() {
		return <Interval onTick={ this.request } period={ EVERY_TEN_SECONDS } />;
	}
}

export default connect( null, {
	activityLogRequest: activityLogRequestAction,
} )( QueryActivityLog );
