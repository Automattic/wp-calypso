/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { requestRecentPostViews } from 'state/stats/views/posts/actions';

class QueryRecentPostViews extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postIds: PropTypes.string.isRequired,
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
		if ( ! siteId || ! postIds ) {
			return;
		}

		this.props.requestRecentPostViews( siteId, postIds, num, date );
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestRecentPostViews }
)( QueryRecentPostViews );
