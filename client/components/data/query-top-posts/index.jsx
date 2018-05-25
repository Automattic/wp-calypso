/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Internal dependencies
 */
import { isRequestingTopPosts } from 'state/stats/top-posts/selectors';
import { requestTopPosts } from 'state/stats/top-posts/actions';

class QueryTopPosts extends Component {
	static defaultProps = {
		requestTopPosts: () => {},
	};

	static propTypes = {
		siteId: PropTypes.number,
		query: PropTypes.object,
		requestingTopPosts: PropTypes.bool,
		requestTopPosts: PropTypes.func,
	};

	componentWillMount() {
		const { requestingTopPosts, siteId, query } = this.props;
		if ( siteId && ! requestingTopPosts && query ) {
			this.requestTopPosts( this.props );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId, query } = this.props;
		if ( siteId === nextProps.siteId && shallowEqual( query, nextProps.query ) ) {
			return;
		}
		this.requestTopPosts( nextProps );
	}

	requestTopPosts( props ) {
		const { siteId, query } = props;
		props.requestTopPosts( siteId, query );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, query } ) => {
		return {
			requestingTopPosts: isRequestingTopPosts( state, siteId, query ),
		};
	},
	{ requestTopPosts },
)( QueryTopPosts );
