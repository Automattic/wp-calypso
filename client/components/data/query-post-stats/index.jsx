/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingPostStat } from 'state/stats/posts/selectors';
import { requestPostStat } from 'state/stats/posts/actions';

class QueryPostStats extends Component {
	componentWillMount() {
		const { requestingPostStat, siteId, postId, stat } = this.props;
		if ( ! requestingPostStat && siteId && postId && stat ) {
			this.requestPostStat( this.props );
		}
	}

	componentWillUnmount() {
		this.clearInterval();
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId, postId, stat, heartbeat } = this.props;
		if (
			! ( siteId && postId && stat ) ||
			( siteId === nextProps.siteId &&
				postId === nextProps.postId &&
				stat === nextProps.stat &&
				heartbeat === nextProps.heartbeat )
			) {
			return;
		}

		this.requestPostStat( nextProps );
	}

	requestPostStat( props ) {
		const { siteId, postId, stat, heartbeat } = props;
		props.requestPostStat( stat, siteId, postId );
		this.clearInterval();
		if ( heartbeat ) {
			this.interval = setInterval( () => {
				props.requestPostStat( stat, siteId, postId );
			}, heartbeat );
		}
	}

	clearInterval() {
		if ( this.interval ) {
			clearInterval( this.interval );
		}
	}

	render() {
		return null;
	}
}

QueryPostStats.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	stat: PropTypes.string,
	requestingPostStat: PropTypes.bool,
	requestPostStat: PropTypes.func,
	heartbeat: PropTypes.number
};

QueryPostStats.defaultProps = {
	requestPostStat: () => {},
	heartbeat: 0
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingPostStat: isRequestingPostStat(
				state, ownProps.stat, ownProps.siteId, ownProps.postId
			)
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestPostStat
		}, dispatch );
	}
)( QueryPostStats );
