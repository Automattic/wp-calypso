/** @format */
/**
 * External dependencies
 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { delay } from 'lodash';

/**
 * Internal dependencies
 */
import { getRewindRestoreProgress as getRewindRestoreProgressAction } from 'state/activity-log/actions';

class QueryRewindRestoreStatus extends PureComponent {
	static propTypes = {
		freshness: PropTypes.number,
		queryDelay: PropTypes.number.isRequired,
		restoreId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.number.isRequired,
	};

	static defaultProps = {
		queryDelay: 0,
	};

	query( props ) {
		const { getRewindRestoreProgress, queryDelay, restoreId, siteId, timestamp } = props;
		if ( ( siteId, timestamp, restoreId ) ) {
			delay( getRewindRestoreProgress, queryDelay, siteId, timestamp, restoreId );
		}
	}

	componentWillMount() {
		this.query( this.props );
	}

	componentWillUpdate( nextProps ) {
		const { freshness, restoreId } = this.props;
		if ( restoreId !== nextProps.restoreId || freshness !== nextProps.freshness ) {
			this.query( nextProps );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	getRewindRestoreProgress: getRewindRestoreProgressAction,
} )( QueryRewindRestoreStatus );
