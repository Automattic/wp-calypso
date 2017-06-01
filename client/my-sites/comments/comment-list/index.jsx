/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, keyBy, map } from 'lodash';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

/**
 * Internal dependencies
 */
import {
	createNotice,
	removeNotice,
} from 'state/notices/actions';
import { getNotices } from 'state/notices/selectors';
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
			this.setState( { comments: keyBy( nextProps.comments, 'ID' ) } );
		}
	}

	showNotice = ( commentId, newStatus, previousStatus ) => {
		const {
			createNotice: createCommentNotice,
			translate,
		} = this.props;

		const options = {
			duration: 5000,
			id: `comment-notice-${ commentId }`,
			isPersistent: true,
		};

		if ( 'delete' !== newStatus ) {
			options.button = translate( 'Undo' );
			options.onClick = () => this.setCommentStatus( commentId, previousStatus, { showNotice: false } );
		}

		switch ( newStatus ) {
			case 'approved':
				return createCommentNotice( 'is-success', translate( 'Comment approved.' ), options );
			case 'unapproved':
				return createCommentNotice( 'is-info', translate( 'Comment unapproved.' ), options );
			case 'spam':
				return createCommentNotice( 'is-warning', translate( 'Comment marked as spam.' ), options );
			case 'trash':
				return createCommentNotice( 'is-error', translate( 'Comment moved to trash.' ), options );
			case 'delete':
				return createCommentNotice( 'is-error', translate( 'Comment delete permanently.' ), options );
		}
	}

	deleteForever = commentId => () => {
		const notice = this.getNoticeContent( commentId, 'delete', 'trash' );
		this.props.createNotice( notice.type, notice.message, notice.options );

		this.setState( {
			comments: filter( this.state.comments, comment => commentId !== comment.ID ),
		} );
	}

	toggleCommentLike = commentId => {
		const comment = this.state.comments[ commentId ];
		const newLikeValue = ! comment.i_like;

		if ( 'unapproved' === comment.status ) {
			this.showNotice( commentId, 'approved', 'unapproved' );
		}

		// If like changes to true, also approve the comment
		this.setState( {
			comments: {
				...this.state.comments,
				[ commentId ]: {
					...comment,
					i_like: newLikeValue,
					status: newLikeValue ? 'approved' : comment.status,
				},
			},
		} );
	}

	setCommentStatus = ( commentId, status, options = { showNotice: true } ) => {
		const comment = this.state.comments[ commentId ];

		if ( status === comment.status ) {
			return;
		}

		this.props.removeNotice( `comment-notice-${ commentId }` );

		// If the comment is not approved anymore, also remove the like, otherwise keep its previous value
		const newLikeValue = 'approved' === status ? comment.i_like : false;

		if ( options.showNotice ) {
			this.showNotice( commentId, status, comment.status );
		}

		this.setState( {
			comments: {
				...this.state.comments,
				[ commentId ]: {
					...comment,
					i_like: newLikeValue,
					status,
				},
			},
		} );
	}

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
				<ReactCSSTransitionGroup
					transitionEnterTimeout={ 150 }
					transitionLeaveTimeout={ 150 }
					transitionName="comment-detail__transition"
				>
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
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => {
	const comments = getSiteComments( state, siteId );
	return {
		comments,
		notices: getNotices( state ),
		siteId,
	};
};

const mapDispatchToProps = {
	createNotice,
	removeNotice,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentList ) );
