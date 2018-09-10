/** @format */

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
import { requestPostsViews } from 'state/stats/views/posts/actions';

class QueryPostsViews extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postIds: PropTypes.arrayOf( PropTypes.number ),
		num: PropTypes.number,
		date: PropTypes.string,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if (
			shallowEqual( this.props.postIds, prevProps.postIds ) &&
			this.props.siteId === prevProps.siteId
		) {
			return;
		}

		this.request();
	}

	request() {
		const { siteId, postIds, num, date } = this.props;
		//console.log( 'query', this.props, postIds.join(",") );

		// Only request stats if a list of post Ids is provided.
		if ( postIds.length ) {
			this.props.requestPostsViews( siteId, postIds.join( ',' ), num, date );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestPostsViews }
)( QueryPostsViews );
