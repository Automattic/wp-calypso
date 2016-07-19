/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import AuthorLink from 'reader/author-link';
import SiteLink from 'reader/site-link';

const StoryHeader = ( { post, onTitleClick, siteName } ) => {
	return (
		<div class="story-header">
			{ post.title
				? <h1 className="reader__post-title" onClick={ onTitleClick }>
					<ExternalLink className="reader__post-title-link" href={ post.URL } target="_blank" icon={ false }>
						{ post.title }
					</ExternalLink>
				</h1>
				: null }

			<ul className="reader-post-byline">
				<li><AuthorLink post={ post } />,</li>
				<li><SiteLink post={ post }>{ siteName }</SiteLink></li>
			</ul>
		</div>
	);
};

export default StoryHeader;
