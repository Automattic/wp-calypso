/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentCounts } from 'state/comments/actions';

export class QuerySiteCommentCounts extends PureComponent {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate() {
		this.request();
	}

	request() {
		if ( ! this.props.siteId ) {
			return;
		}
		this.props.requestCommentCounts( { ...this.props } );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentCounts } )( QuerySiteCommentCounts );
