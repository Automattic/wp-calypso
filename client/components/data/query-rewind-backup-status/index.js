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
import { getRewindBackupProgress } from 'state/activity-log/actions';

class QueryRewindBackupStatus extends PureComponent {
	static propTypes = {
		freshness: PropTypes.number,
		queryDelay: PropTypes.number.isRequired,
		downloadId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
	};

	static defaultProps = {
		queryDelay: 0,
	};

	query( props ) {
		const { getBackupProgress, queryDelay, downloadId, siteId } = props;
		if ( ( siteId, downloadId ) ) {
			delay( getBackupProgress, queryDelay, siteId, downloadId );
		}
	}

	componentWillMount() {
		this.query( this.props );
	}

	componentWillUpdate( nextProps ) {
		const { freshness, downloadId } = this.props;
		if ( downloadId !== nextProps.downloadId || freshness !== nextProps.freshness ) {
			this.query( nextProps );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	getBackupProgress: getRewindBackupProgress,
} )( QueryRewindBackupStatus );
