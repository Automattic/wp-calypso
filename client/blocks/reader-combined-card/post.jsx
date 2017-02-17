/**
 * External Dependencies
 */
import React from 'react';
import { has } from 'lodash';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import ReaderPostCardExcerpt from 'blocks/reader-post-card/excerpt';
import ReaderPostActionsVisitLink from 'blocks/reader-post-actions/visit';
import ReaderAuthorLink from 'blocks/reader-author-link';

const ReaderCombinedCardPost = ( { post, streamUrl /*, site, feed*/ } ) => {
	const hasAuthorName = has( post, 'author.name' );

	return (
		<li className="reader-combined-card__post">
			<AutoDirection>
				<h1 className="reader-combined-card__post-title">
					<a className="reader-combined-card__post-title-link" href={ post.URL }>{ post.title }</a>
				</h1>
			</AutoDirection>
			<ReaderPostCardExcerpt post={ post } isDiscover={ false } />
			<ReaderPostActionsVisitLink visitUrl={ post.URL } />
			{ hasAuthorName &&
				<ReaderAuthorLink
					className="reader-combined-card__author-link"
					author={ post.author }
					siteUrl={ streamUrl }
					post={ post }>
					{ post.author.name }
				</ReaderAuthorLink>
			}
		</li>
	);
};

ReaderCombinedCardPost.propTypes = {
	post: React.PropTypes.object.isRequired,
	streamUrl: React.PropTypes.string,
	site: React.PropTypes.object,
	feed: React.PropTypes.object,
};

export default ReaderCombinedCardPost;
