/**
 * External dependencies
 *
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { changeCommentStatus } from 'state/comments/actions';
import { getSiteComment } from 'state/comments/selectors';
import { removeNotice, successNotice } from 'state/notices/actions';

class ModerateComment extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number.isRequired,
		newStatus: PropTypes.string,
		currentStatus: PropTypes.string,
		updateCommentStatus: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.moderate( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			this.props.siteId === nextProps.siteId &&
			this.props.postId === nextProps.postId &&
			this.props.commentId === nextProps.commentId &&
			this.props.newStatus === nextProps.newStatus
		) {
			return;
		}

		this.moderate( nextProps );
	}

	showNotice( status ) {
		const { translate } = this.props;

		this.props.removeNotice( 'comment-notice' );

		const message = get(
			{
				approved: translate( 'Comment approved.' ),
				unapproved: translate( 'Comment unapproved.' ),
				spam: translate( 'Comment marked as spam.' ),
				trash: translate( 'Comment moved to trash.' ),
			},
			status
		);

		const noticeOptions = {
			id: 'comment-notice',
			isPersistent: true,
		};

		this.props.successNotice( message, noticeOptions );
	}

	moderate( { siteId, postId, commentId, newStatus, currentStatus, updateCommentStatus } ) {
		if (
			! siteId ||
			! postId ||
			! commentId ||
			! newStatus ||
			newStatus === currentStatus ||
			'edit' === newStatus ||
			'delete' === newStatus
		) {
			return;
		}

		updateCommentStatus();
		this.showNotice( newStatus );
	}

	render() {
		return null;
	}
}

const mapStateToProps = ( state, { siteId, commentId } ) => {
	const comment = getSiteComment( state, siteId, commentId );

	return {
		currentStatus: get( comment, 'status' ),
	};
};

const mapDispatchToProps = ( dispatch, { siteId, postId, commentId, newStatus } ) => ( {
	removeNotice: ( noticeId ) => dispatch( removeNotice( noticeId ) ),
	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
	updateCommentStatus: () =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_change_status_from_email', {
						status: newStatus,
					} ),
					bumpStat( 'calypso_comment_management', 'comment_status_changed_to_' + newStatus )
				),
				changeCommentStatus( siteId, postId, commentId, newStatus )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ModerateComment ) );
