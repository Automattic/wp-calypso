/**
 * External dependencies
 *
 * @format
 */

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { delay } from 'lodash';

/**
 * Internal dependencies
 */
import { getRewindRestoreProgress as getRewindRestoreProgressAction } from 'state/activity-log/actions';
import { getLastRestore } from 'state/selectors';

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
		restoreId: 0,
		freshness: 0,
		timestamp: 0,
	};

	query( props ) {
		const { getRewindRestoreProgress, queryDelay, restoreId, siteId, timestamp } = props;
		if ( ( siteId, timestamp, restoreId ) ) {
			delay( getRewindRestoreProgress, queryDelay, siteId, timestamp, restoreId );
		}
	}

	componentWillMount() {
		const restoreProps = Object.assign( {}, this.props );
		const { restoreId, timestamp, lastRestore } = this.props;
		if ( ! restoreId && lastRestore.restore_id ) {
			restoreProps.restoreId = lastRestore.restore_id;
		}
		if ( ! timestamp && lastRestore.when ) {
			restoreProps.timestamp = new Date( lastRestore.when ).getTime();
		}
		console.log( 'this.props', this.props );
		console.log( 'lastRestore', lastRestore );
		if ( restoreProps.restoreId && restoreProps.timestamp ) {
			this.query( restoreProps );
		}
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

export default connect(
	( state, { siteId } ) => ( {
		lastRestore: getLastRestore( state, siteId ),
	} ),
	{
		getRewindRestoreProgress: getRewindRestoreProgressAction,
	}
)( QueryRewindRestoreStatus );
