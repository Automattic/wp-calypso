/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import { isRequestingVideoStats } from 'state/stats/videos/selectors';
import { requestVideoStats } from 'state/stats/videos/actions';

class QueryVideoStats extends Component {
	static defaultProps = {
		requestVideoStats: () => {},
		heartbeat: 0,
	};

	static propTypes = {
		siteId: PropTypes.number,
		videoId: PropTypes.number,
		requestingVideoStats: PropTypes.bool,
		requestVideoStats: PropTypes.func,
		heartbeat: PropTypes.number
	};

	componentWillMount() {
		const { requestingVideoStats, siteId, videoId } = this.props;
		if ( ! requestingVideoStats && siteId && ! isUndefined( videoId ) ) {
			this.requestVideoStats( this.props );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId, videoId } = this.props;
		if (
			! ( siteId && ! isUndefined( videoId ) ) ||
			( siteId === nextProps.siteId &&
				videoId === nextProps.videoId )
			) {
			return;
		}

		this.requestVideoStats( nextProps );
	}

	requestVideoStats( props ) {
		const { siteId, videoId } = props;
		props.requestVideoStats( siteId, videoId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, videoId } ) => {
		return {
			requestingVideoStats: isRequestingVideoStats(
				state, siteId, videoId
			)
		};
	},
	{ requestVideoStats }
)( QueryVideoStats );
