/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { take, map } from 'lodash';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import ReaderExcerpt from 'blocks/reader-excerpt';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu';
import FeaturedAsset from './featured-asset';
import { getDateSortedPostComments } from 'state/comments/selectors';
import ConversationsComments from 'blocks/conversations/list';

const CompactPost = ( { post, postByline, children, isDiscover, comments } ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const commentIdsToShow = map( take( comments, 3 ), 'ID' );
	return (
		<div>
			<div className="reader-post-card__post">
				<FeaturedAsset
					canonicalMedia={ post.canonical_media }
					postUrl={ post.URL }
					allowVideoPlaying={ false }
				/>
				<div className="reader-post-card__post-details">
					{ postByline }
					<ReaderPostOptionsMenu
						className="ignore-click"
						showFollow={ true }
						post={ post }
						position="bottom"
					/>
					<AutoDirection>
						<h1 className="reader-post-card__title">
							<a className="reader-post-card__title-link" href={ post.URL }>
								<Emojify>
									{ post.title }
								</Emojify>
							</a>
						</h1>
					</AutoDirection>
					<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
					{ children }
				</div>
			</div>
			<ConversationsComments
				post={ post }
				postId={ post.ID }
				blogId={ post.site_ID }
				commentIds={ commentIdsToShow }
			/>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

CompactPost.propTypes = {
	post: React.PropTypes.object.isRequired,
	postByline: React.PropTypes.object,
	isDiscover: React.PropTypes.bool,
};

export default connect( ( state, ownProps ) => {
	const { site_ID: siteId, ID: postId } = ownProps.post;
	return {
		comments: getDateSortedPostComments( state, siteId, postId ),
	};
} )( CompactPost );
