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
		downloadId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
	};

	query( props ) {
		const { getBackupProgress, downloadId, siteId } = props;
		if ( siteId && downloadId ) {
			delay( getBackupProgress, 1500, siteId, downloadId );
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
