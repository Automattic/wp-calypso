/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { chunk, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { requestRecentPostViews } from 'state/stats/recent-post-views/actions';

class QueryRecentPostViews extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postIds: PropTypes.arrayOf( PropTypes.number ).isRequired,
		num: PropTypes.number,
		date: PropTypes.string,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( isEqual( { ...this.props }, { ...prevProps } ) ) {
			return;
		}

		this.request();
	}

	request() {
		const { siteId, postIds, num, date } = this.props;

		// Only request stats if site ID and a list of post IDs is provided.
		if ( ! siteId || postIds.length < 1 ) {
			return;
		}

		// Break post_ids into chunks of 100 because `stats/views/posts`
		// is limited to 100 post_ids per query.
		const postIdsChunks = chunk( postIds, 100 );
		postIdsChunks.forEach( ( postIdsChunk ) =>
			this.props.requestRecentPostViews( siteId, postIdsChunk, num, date )
		);
	}

	render() {
		return null;
	}
}

export default connect( null, { requestRecentPostViews } )( QueryRecentPostViews );
