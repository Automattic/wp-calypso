/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import ReaderExcerpt from 'blocks/reader-excerpt';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu';
import FeaturedAsset from './featured-asset';

const CompactPost = ( {
	post,
	postByline,
	children,
	isDiscover,
	showFollowingForAllUnmutedConversations,
	onClick,
} ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="reader-post-card__post" onClick={ onClick }>
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
					showFollowingForAllUnmutedConversations={ showFollowingForAllUnmutedConversations }
				/>
				<AutoDirection>
					<h1 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>
							<Emojify>{ post.title }</Emojify>
						</a>
					</h1>
				</AutoDirection>
				<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
				{ children }
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

CompactPost.propTypes = {
	post: PropTypes.object.isRequired,
	postByline: PropTypes.object,
	isDiscover: PropTypes.bool,
};

export default CompactPost;
