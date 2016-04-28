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
		if ( !this.props.requestingPostStat &&
			this.props.siteId &&
			this.props.postId &&
			this.props.stat ) {
			this.props.requestPostStat( this.props.stat, this.props.siteId, this.props.postId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if (
			! ( this.props.siteId && this.props.postId && this.props.stat ) ||
			( this.props.siteId === nextProps.siteId &&
				this.props.postId === nextProps.postId &&
				this.props.stat === nextProps.stat )
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
