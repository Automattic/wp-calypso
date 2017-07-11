/**
 * External dependencies
 */
import { PropTypes, PureComponent } from 'react';
import debugFactory from 'debug';
import { connect } from 'react-redux';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { getRestoreProgress } from 'state/selectors';
import { getRewindRestoreProgress as getRewindRestoreProgressAction } from 'state/activity-log/actions';

const debug = debugFactory( 'calypso:activity-log:poll-restore-progress' );

class PollRewindRestoreStatus extends PureComponent {
	static propTypes = {
		freshness: PropTypes.number,
		pollWait: PropTypes.number.isRequired,
		restoreId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.number,
	};

	static defaultProps = {
		pollWait: 1500,
	};

	pollTimeout = null;

	query( props ) {
		const {
			getRewindRestoreProgress,
			restoreId,
			siteId,
			timestamp,
		} = props;
		if ( siteId, timestamp, restoreId ) {
			this.pollTimeout = setTimeout(
				() => getRewindRestoreProgress( siteId, timestamp, restoreId ),
				props.pollWait
			);
		}
	}

	stopPolling() {
		if ( this.pollTimeout ) {
			debug( 'Clearing timeout' );
			clearTimeout( this.pollTimeout );
			this.pollTimeout = null;
		}
	}

	componentWillMount() {
		debug( 'CWMount', this.props );
		this.query( this.props );
	}

	componentWillUpdate( nextProps ) {
		const {
			freshness,
			restoreId,
		} = this.props;
		debug( 'CWUpdate next: %o this: %o', this.props, nextProps );
		if (
			restoreId !== nextProps.restoreId ||
			freshness !== nextProps.freshness
		) {
			this.stopPolling();
			this.query( nextProps );
		}
	}

	componentWillUnmount() {
		this.stopPolling();
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => pick( getRestoreProgress( state, siteId ), [
		'freshness',
		'restoreId',
		'timestamp',
	] ),
	{
		getRewindRestoreProgress: getRewindRestoreProgressAction,
	}
)( PollRewindRestoreStatus );
