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
			this.props.requestPostStat( stat, siteId, postId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId, postId, stat } = this.props;
		if (
			! ( siteId && postId && stat ) ||
			( siteId === nextProps.siteId &&
				postId === nextProps.postId &&
				stat === nextProps.stat )
			) {
			return;
		}

		nextProps.requestPostStat( nextProps.stat, nextProps.siteId, nextProps.postId );
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
	requestPostStat: PropTypes.func
};

QueryPostStats.defaultProps = {
	requestPostStat: () => {}
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
