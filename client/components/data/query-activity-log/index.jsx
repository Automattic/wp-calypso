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
import {
	activityLogRequest as activityLogRequestAction,
	startWatching,
	stopWatching,
} from 'state/activity-log/actions';

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
		this.props.siteId && this.props.startWatching( this.props.siteId );
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.request( nextProps );

		if ( this.props.siteId !== nextProps.siteId ) {
			this.props.stopWatching( this.props.siteId );
			this.props.startWatching( nextProps.siteId );
		}
	}

	componentWillUnmount() {
		this.props.stopWatching( this.props.siteId );
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

const mapDispatchToProps = {
	activityLogRequest: activityLogRequestAction,
	startWatching,
	stopWatching,
};

export default connect( null, mapDispatchToProps )( QueryActivityLog );
