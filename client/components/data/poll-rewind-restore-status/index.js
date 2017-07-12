/**
 * External dependencies
 */
import { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { getRestoreProgress } from 'state/selectors';
import { getRewindRestoreProgress as getRewindRestoreProgressAction } from 'state/activity-log/actions';

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

	query( props ) {
		const {
			getRewindRestoreProgress,
			restoreId,
			siteId,
			timestamp,
		} = props;
		if ( siteId, timestamp, restoreId ) {
			setTimeout(
				() => getRewindRestoreProgress( siteId, timestamp, restoreId ),
				props.pollWait
			);
		}
	}

	componentWillMount() {
		this.query( this.props );
	}

	componentWillUpdate( nextProps ) {
		const {
			freshness,
			restoreId,
		} = this.props;
		if (
			restoreId !== nextProps.restoreId ||
			freshness !== nextProps.freshness
		) {
			this.query( nextProps );
		}
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
