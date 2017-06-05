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
		comments: PropTypes.object,
		deleteCommentPermanently: PropTypes.func,
		setCommentLike: PropTypes.func,
		setCommentStatus: PropTypes.func,
		siteId: PropTypes.number,
		status: PropTypes.string,
		toggleCommentLike: PropTypes.func,
		translate: PropTypes.func,
	};

	state = {
		isBulkEdit: false,
	};

	deleteCommentPermanently = commentId => () => {
		this.props.removeNotice( `comment-notice-${ commentId }` );
		this.showNotice( commentId, 'delete', 'trash' );

		this.props.deleteCommentPermanently( commentId );
	}

	getEmptyMessage = () => {
		const { status, translate } = this.props;

		const defaultLine = translate( 'Your queue is clear.' );

		return get( {
			unapproved: [ translate( 'No new comments yet.' ), defaultLine ],
			approved: [ translate( 'No approved comments.' ), defaultLine ],
			spam: [ translate( 'No spam comments.' ), defaultLine ],
			trash: [ translate( 'No deleted comments.' ), defaultLine ],
			all: [ translate( 'No comments yet.' ), defaultLine ],
		}, status, [ '', '' ] );
	}

	setCommentStatus = ( commentId, status, options = { showNotice: true } ) => {
		const comment = this.props.comments[ commentId ];

		if ( status === comment.status ) {
			return;
		}

		this.props.removeNotice( `comment-notice-${ commentId }` );

		if ( options.showNotice ) {
			this.showNotice( commentId, status, comment.status );
		}

		this.props.setCommentStatus( commentId, status );
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
		const comment = this.props.comments[ commentId ];

		if ( 'unapproved' === comment.status ) {
			this.props.removeNotice( `comment-notice-${ commentId }` );
			this.showNotice( commentId, 'approved', 'unapproved' );
		}

		this.props.toggleCommentLike( commentId );
	}

	render() {
		const {
			comments,
			siteId,
			siteSlug,
			status,
		} = this.props;
		const {
			isBulkEdit,
		} = this.state;

		const filteredComments = 'all' === status
			? filter( comments, comment => 'approved' === comment.status || 'unapproved' === comment.status )
			: filter( comments, comment => status === comment.status );

		const [ emptyMessageTitle, emptyMessageLine ] = this.getEmptyMessage();

		return (
			<div className="comment-list">
				<CommentNavigation { ...{
					isBulkEdit,
					siteSlug,
					status,
					toggleBulkEdit: this.toggleBulkEdit,
				} } />

				<ReactCSSTransitionGroup
					transitionEnterTimeout={ 300 }
					transitionLeaveTimeout={ 150 }
					transitionName="comment-detail__transition"
				>
					{ map( filteredComments, comment =>
						<CommentDetail
							comment={ comment }
							deleteCommentPermanently={ this.deleteCommentPermanently( comment.ID ) }
							isBulkEdit={ isBulkEdit }
							key={ `comment-${ siteId }-${ comment.ID }` }
							setCommentStatus={ this.setCommentStatus }
							siteId={ siteId }
							toggleCommentLike={ this.toggleCommentLike }
						/>
					) }
				</ReactCSSTransitionGroup>

				<ReactCSSTransitionGroup
					transitionEnterTimeout={ 300 }
					transitionLeaveTimeout={ 150 }
					transitionName="comment-list__transition"
				>
					{ null === filteredComments &&
						<CommentDetailPlaceholder
							key="comment-detail-placeholder"
						/>
					}

					{ 0 === size( filteredComments ) &&
						<EmptyContent
							illustration="/calypso/images/comments/illustration_comments_gray.svg"
							illustrationWidth={ 150 }
							key="comment-list-empty"
							line={ emptyMessageLine }
							title={ emptyMessageTitle }
						/>
					}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

export const CommentFaker = WrappedCommentList => class extends Component {
	state = {
		comments: {},
		isBulkEdit: false,
	};

	componentWillMount() {
		if ( this.props.comments.length ) {
			this.setState( { comments: keyBy( this.props.comments, 'ID' ) } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.comments.length ) {
			this.setState( { comments: keyBy( nextProps.comments, 'ID' ) } );
		}
	}

	deleteCommentPermanently = commentId => this.setState( { comments: omit( this.state.comments, commentId ) } );

	setCommentLike = ( commentId, likeValue ) => {
		const comment = this.state.comments[ commentId ];
		// If like changes to true, also approve the comment
		this.setState( {
			comments: {
				...this.state.comments,
				[ commentId ]: {
					...comment,
					i_like: likeValue,
					status: likeValue ? 'approved' : comment.status,
				}
			},
		} );
	}

	setCommentStatus = ( commentId, status ) => {
		const comment = this.state.comments[ commentId ];
		// If the comment is not approved anymore, also remove the like, otherwise keep its previous value
		this.setState( {
			comments: {
				...this.state.comments,
				[ commentId ]: {
					...comment,
					i_like: 'approved' === status ? comment.i_like : false,
					status,
				}
			},
		} );
	}

	toggleCommentLike = commentId => {
		const comment = this.state.comments[ commentId ];
		const likeValue = ! comment.i_like;
		// If like changes to true, also approve the comment
		this.setState( {
			comments: {
				...this.state.comments,
				[ commentId ]: {
					...comment,
					i_like: likeValue,
					status: likeValue ? 'approved' : comment.status,
				}
			},
		} );
	}

	render() {
		return (
			<WrappedCommentList
				{ ...this.props }
				comments={ this.state.comments }
				deleteCommentPermanently={ this.deleteCommentPermanently }
				setCommentLike={ this.setCommentLike }
				setCommentStatus={ this.setCommentStatus }
				toggleCommentLike={ this.toggleCommentLike }
			/>
		);
	}
};

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

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentFaker( CommentList ) ) );
