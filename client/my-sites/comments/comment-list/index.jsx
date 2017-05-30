/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, get, keyBy, map, omit, size } from 'lodash';
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
import CommentDetailPlaceholder from 'blocks/comment-detail/comment-detail-placeholder';
import CommentNavigation from '../comment-navigation';
import EmptyContent from 'components/empty-content';

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

	deleteForever = commentId => () => {
		this.props.removeNotice( `comment-notice-${ commentId }` );
		this.showNotice( commentId, 'delete', 'trash' );

		this.setState( { comments: omit( this.state.comments, commentId ) } );
	}

	getEmptyMessage = () => {
		const { status, translate } = this.props;

		switch ( status ) {
			case 'unapproved':
				return {
					title: translate( 'No new comments yet.' ),
					line: translate( 'Your queue is clear.' ),
				};
			case 'approved':
				return {
					title: translate( 'No approved comments.' ),
					line: translate( 'Your queue is clear.' ),
				};
			case 'spam':
				return {
					title: translate( 'No spam comments.' ),
					line: translate( 'Your queue is clear.' ),
				};
			case 'trash':
				return {
					title: translate( 'No deleted comments.' ),
					line: translate( 'Your queue is clear.' ),
				};
			case 'all':
				return {
					title: translate( 'No comments yet.' ),
					line: translate( 'Your queue is clear.' ),
				};
		}
	}

	setCommentStatus = ( commentId, status, options = { showNotice: true } ) => {
		const comment = this.state.comments[ commentId ];

		if ( status === comment.status ) {
			return;
		}

		// If the comment is not approved anymore, also remove the like, otherwise keep its previous value
		const newLikeValue = 'approved' === status ? comment.i_like : false;

		this.props.removeNotice( `comment-notice-${ commentId }` );

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

	showNotice = ( commentId, newStatus, previousStatus ) => {
		const { translate } = this.props;

		const [ type, message ] = get( {
			approved: [ 'is-success', translate( 'Comment approved.' ) ],
			unapproved: [ 'is-info', translate( 'Comment unapproved.' ) ],
			spam: [ 'is-warning', translate( 'Comment marked as spam.' ) ],
			trash: [ 'is-error', translate( 'Comment moved to trash.' ) ],
			'delete': [ 'is-error', translate( 'Comment deleted permanently.' ) ],
		}, newStatus, [ null, null ] );

		if ( ! type ) {
			return;
		}

		const options = Object.assign(
			{
				duration: 5000,
				id: `comment-notice-${ commentId }`,
				isPersistent: true,
			},
			'delete' !== newStatus && {
				button: translate( 'Undo' ),
				onClick: () => this.setCommentStatus( commentId, previousStatus, { showNotice: false } ),
			}
		);

		this.props.createNotice( type, message, options );
	}

	toggleBulkEdit = () => this.setState( { isBulkEdit: ! this.state.isBulkEdit } );

	toggleCommentLike = commentId => {
		const comment = this.state.comments[ commentId ];
		const newLikeValue = ! comment.i_like;

		if ( 'unapproved' === comment.status ) {
			this.props.removeNotice( `comment-notice-${ commentId }` );
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
				{ null === filteredComments &&
					<CommentDetailPlaceholder />
				}
				{ 0 === size( filteredComments ) &&
					<EmptyContent { ...this.getEmptyMessage() } />
				}
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
