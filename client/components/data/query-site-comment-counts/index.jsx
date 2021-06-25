/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentCounts } from 'calypso/state/comments/actions';

export class QuerySiteCommentCounts extends PureComponent {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId || this.props.postId !== prevProps.postId ) {
			this.request();
		}
	}

	request() {
		if ( ! this.props.siteId ) {
			return;
		}
		this.props.requestCommentCounts( this.props.siteId, this.props.postId );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentCounts } )( QuerySiteCommentCounts );
