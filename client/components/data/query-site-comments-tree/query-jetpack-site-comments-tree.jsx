/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentsList } from 'state/comments/actions';

export class QueryJetpackSiteCommentsTree extends Component {
	static propTypes = {
		page: PropTypes.number,
		siteId: PropTypes.number,
		status: PropTypes.string,
	};

	static defaultProps = {
		page: 1,
		status: 'unapproved',
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( { page, siteId, status } ) {
		if ( page !== this.props.page || siteId !== this.props.siteId || status !== this.props.status ) {
			this.request();
		}
	}

	request() {
		const { page, siteId, status } = this.props;
		if ( ! siteId ) {
			return;
		}

		const query = {
			listType: 'site',
			number: 100,
			offset: ( page - 1 ) * 20, // see CommentList COMMENTS_PER_PAGE constant
			siteId,
			status,
			type: 'comment',
		};
		this.props.requestCommentsList( query );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentsList } )( QueryJetpackSiteCommentsTree );
