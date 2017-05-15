/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import CommentButton from 'blocks/comment-button';
import LikeButton from 'reader/like-button';
import ShareButton from 'blocks/reader-share';
import PostEditButton from 'blocks/post-edit-button';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu';
import { shouldShowComments } from 'blocks/comments/helper';
import { shouldShowLikes } from 'reader/like-helper';
import { shouldShowShare } from 'blocks/reader-share/helper';
import { userCan } from 'lib/posts/utils';
import * as stats from 'reader/stats';
import { localize } from 'i18n-calypso';
import ReaderVisitLink from 'blocks/reader-visit-link';

const ReaderPostActions = ( props ) => {
	const {
		post,
		site,
		onCommentClick,
		showEdit,
		showVisit,
		showMenu,
		showMenuFollow,
		iconSize,
		className,
		visitUrl,
		fullPost,
		translate,
	} = props;

	const onEditClick = () => {
		stats.recordAction( 'edit_post' );
		stats.recordGaEvent( 'Clicked Edit Post', 'full_post' );
		stats.recordTrackForPost( 'calypso_reader_edit_post_clicked', post );
	};

	function onPermalinkVisit() {
		stats.recordPermalinkClick( 'card', post );
	}

	const listClassnames = classnames( 'reader-post-actions', className );

	/* eslint-disable react/jsx-no-target-blank */
	return (
		<ul className={ listClassnames }>
			{ showVisit &&
				<li className="reader-post-actions__item reader-post-actions__visit">
					<ReaderVisitLink
						href={ visitUrl || post.URL }
						iconSize={ iconSize }
						onClick={ onPermalinkVisit }>
							{ translate( 'Visit' ) }
					</ReaderVisitLink>
				</li>
			}
			{ showEdit && site && userCan( 'edit_post', post ) &&
				<li className="reader-post-actions__item">
					<PostEditButton post={ post } site={ site } onClick={ onEditClick } iconSize={ iconSize } />
				</li>
			}
			{ shouldShowShare( post ) &&
				<li className="reader-post-actions__item">
					<ShareButton post={ post } position="bottom" tagName="div" iconSize={ iconSize } />
				</li>
			}
			{ shouldShowComments( post ) &&
				<li className="reader-post-actions__item">
					<CommentButton
						key="comment-button"
						commentCount={ post.discussion.comment_count }
						onClick={ onCommentClick }
						tagName="div"
						size={ iconSize } />
				</li>
			}
			{ shouldShowLikes( post ) &&
				<li className="reader-post-actions__item">
					<LikeButton
						key="like-button"
						siteId={ +post.site_ID }
						postId={ +post.ID }
						post={ post }
						site={ site }
						fullPost={ fullPost }
						tagName="div"
						forceCounter={ true }
						iconSize={ iconSize }
						showZeroCount={ false } />
				</li>
			}
			{ showMenu &&
				<li className="reader-post-actions__item">
					<ReaderPostOptionsMenu className="ignore-click" showFollow={ showMenuFollow } post={ post } />
				</li>
			}
		</ul>
	);
	/* eslint-enable react/jsx-no-target-blank */
};

ReaderPostActions.propTypes = {
	post: React.PropTypes.object.isRequired,
	site: React.PropTypes.object,
	onCommentClick: React.PropTypes.func,
	showEdit: React.PropTypes.bool,
	iconSize: React.PropTypes.number,
	showMenu: React.PropTypes.bool,
	showMenuFollow: React.PropTypes.bool,
	visitUrl: React.PropTypes.string,
	fullPost: React.PropTypes.bool,
};

ReaderPostActions.defaultProps = {
	showEdit: true,
	showVisit: false,
	showMenu: false,
	iconSize: 24,
	showMenuFollow: true
};

export default localize( ReaderPostActions );
