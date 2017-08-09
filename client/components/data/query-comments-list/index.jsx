/**
 * External dependencies
 */
import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentsList } from 'state/comments/actions';

export class QueryCommentsList extends PureComponent {
	static propTypes = {
		page: PropTypes.number,
		query: PropTypes.object,
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

	componentDidUpdate() {
		this.request();
	}

	request() {
		const { page, query, siteId, status } = this.props;
		if ( ! siteId ) {
			return;
		}

		const defaultQuery = {
			listType: 'site',
			number: 100,
			offset: ( page - 1 ) * 20, // see CommentList COMMENTS_PER_PAGE constant
			siteId,
			status,
			type: 'comment',
		};
		this.props.requestCommentsList( { ...defaultQuery, ...query } );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentsList } )( QueryCommentsList );
