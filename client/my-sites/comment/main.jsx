/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
// import { isEnabled } from 'config';
import EmptyContent from 'components/empty-content';
import getSiteId from 'state/selectors/get-site-id';
// import { isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import Comment from 'my-sites/comments/comment';
import CommentPermalink from 'my-sites/comment/comment-permalink';
import CommentListHeader from 'my-sites/comments/comment-list/comment-list-header';
import { getSiteComment, canCurrentUser } from 'state/selectors';
import { preventWidows } from 'lib/formatting';

export class CommentView extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number.isRequired,
		canModerateComments: PropTypes.bool.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { siteId, postId, commentId, canModerateComments, translate } = this.props;

		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<Main className="comments" wideLayout>
				<PageViewTracker path="/comment/:site" title="Comments" />
				<DocumentHead title={ translate( 'Comment' ) } />
				<CommentListHeader { ...{ postId } } />
				{ ! canModerateComments && (
					<EmptyContent
						title={ preventWidows(
							translate( "Oops! You don't have permission to manage comments." )
						) }
						line={ preventWidows(
							translate( "If you think you should, contact this site's administrator." )
						) }
						illustration="/calypso/images/illustrations/illustration-500.svg"
					/>
				) }
				{ canModerateComments && <Comment commentId={ commentId } refreshCommentData={ true } /> }
				{ canModerateComments && <CommentPermalink { ...{ siteId, commentId } } /> }
			</Main>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { commentId, siteFragment } = ownProps;

	const siteId = getSiteId( state, siteFragment );
	// const isJetpack = isJetpackSite( state, siteId );
	const comment = getSiteComment( state, siteId, commentId );
	const postId = get( comment, 'post.ID' );

	const canModerateComments = canCurrentUser( state, siteId, 'moderate_comments' );
	// const showJetpackUpdateScreen =
	// 	isJetpack &&
	// 	! isJetpackMinimumVersion( state, siteId, '5.5' ) &&
	// 	isEnabled( 'comments/management/jetpack-5.5' );

	return {
		siteId,
		postId,
		canModerateComments,
	};
};

export default connect( mapStateToProps )( localize( CommentView ) );
