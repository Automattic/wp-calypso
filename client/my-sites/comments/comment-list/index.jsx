/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { filter, map } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteComments from 'state/selectors/get-site-comments';
import CommentDetail from 'blocks/comment-detail';
import CommentNavigation from '../comment-navigation';

export class CommentList extends Component {
	static propTypes = {
		comments: PropTypes.array,
		siteId: PropTypes.number,
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	state = {
		comments: [],
		isBulkEdit: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.comments.length ) {
			this.setState( { comments: nextProps.comments } );
		}
	}

	deleteForever = commentId => () => {
		this.setState( {
			comments: filter( this.state.comments, comment => commentId !== comment.ID ),
		} );
	}

	toggleCommentLike = commentId => {
		const comments = map( this.state.comments, comment => {
			if ( commentId === comment.ID ) {
				const newLike = ! comment.i_like;
				// If like changes to true, also approve the comment
				return {
					...comment,
					i_like: newLike,
					status: newLike ? 'approved' : comment.status,
				};
			}
			return comment;
		} );

		this.setState( { comments } );
	};

	setCommentStatus = ( commentId, status ) => {
		let statusChanged = false;

		const comments = map( this.state.comments, comment => {
			if ( commentId === comment.ID && status !== comment.status ) {
				statusChanged = true;
				// If status changes to unapproved/spam/trash, also remove the like
				return {
					...comment,
					i_like: 'approved' === status ? comment.i_like : false,
					status,
				};
			}
			return comment;
		} );

		if ( statusChanged ) {
			this.setState( { comments } );
		}
	};

	toggleBulkEdit = () => this.setState( { isBulkEdit: ! this.state.isBulkEdit } );

	render() {
		const {
			siteId,
			siteSlug,
			status,
		} = this.props;
		const {
			comments,
			isBulkEdit,
		} = this.state;

		const filteredComments = 'all' === status
			? filter( comments, comment => 'approved' === comment.status || 'unapproved' === comment.status )
			: filter( comments, comment => status === comment.status );

		return (
			<div className="comment-list">
				<CommentNavigation { ...{
					isBulkEdit,
					siteSlug,
					status,
					toggleBulkEdit: this.toggleBulkEdit,
				} } />
				{ map( filteredComments, comment =>
					<CommentDetail
						commentId={ comment.ID }
						deleteForever={ this.deleteForever( comment.ID ) }
						isBulkEdit={ isBulkEdit }
						key={ `comment-${ siteId }-${ comment.ID }` }
						setCommentStatus={ this.setCommentStatus }
						siteId={ siteId }
						toggleCommentLike={ this.toggleCommentLike }
						{ ...comment }
					/>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => {
	const comments = getSiteComments( state, siteId );
	return {
		comments,
		siteId,
	};
};

export default connect( mapStateToProps )( CommentList );
