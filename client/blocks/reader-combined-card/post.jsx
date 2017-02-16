/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import ReaderPostCardExcerpt from 'blocks/reader-post-card/excerpt';
import ReaderPostActionsVisitLink from 'blocks/reader-post-actions/visit';

const ReaderCombinedCardPost = ( { post/*, site, feed*/ } ) => {
	return (
		<li className="reader-combined-card__post">
			<AutoDirection>
				<h1 className="reader-combined-card__post-title">
					<a className="reader-combined-card__post-title-link" href={ post.URL }>{ post.title }</a>
				</h1>
			</AutoDirection>
			<ReaderPostCardExcerpt post={ post } isDiscover={ false } />
			<ReaderPostActionsVisitLink visitUrl={ post.URL } />
		</li>
	);
};

ReaderCombinedCardPost.propTypes = {
	post: React.PropTypes.object.isRequired,
	site: React.PropTypes.object,
	feed: React.PropTypes.object,
};

export default ReaderCombinedCardPost;
