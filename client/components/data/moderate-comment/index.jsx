/** @format */
/**
 * External dependencies
 *
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import { changeCommentStatus, deleteComment } from 'state/comments/actions';
import { getSiteComment } from 'state/selectors';

class ModerateComment extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number.isRequired,
		newStatus: PropTypes.string,
		currentStatus: PropTypes.string,
		updateCommentStatus: PropTypes.func.isRequired,
		redirectToPostView: PropTypes.func.isRequired,
		destroyComment: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.moderate( this.props );
	}

	componentWillReceiveProps( nextProps ) {
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

	moderate( {
		siteId,
		postId,
		commentId,
		newStatus,
		currentStatus,
		redirectToPostView,
		updateCommentStatus,
		destroyComment,
	} ) {
		if ( ! siteId || ! postId || ! commentId || ! newStatus || newStatus === currentStatus ) {
			return;
		}

		if ( 'delete' === newStatus ) {
			destroyComment();
			redirectToPostView( postId );
			return;
		}

		updateCommentStatus();
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
	destroyComment: () =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_delete' ),
					bumpStat( 'calypso_comment_management', 'comment_deleted' )
				),
				deleteComment( siteId, postId, commentId )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( ModerateComment );
