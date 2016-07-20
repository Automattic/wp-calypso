/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import AuthorLink from 'reader/author-link';
import SiteLink from 'reader/site-link';
import Gravatar from 'components/gravatar';
import PostTime from 'reader/post-time';

const StoryHeader = ( { post, onTitleClick, onDateClick, siteName } ) => {
	if ( ! post ) {
		return null;
	}
	return (
		<div className="story-header">
			<Gravatar user={ post.author } size={ 96 } />
			<div className="story-header__main">
				{ post.title /* @todo class names need fixing */
					? <h1 className="reader__post-title" onClick={ onTitleClick }>
						<ExternalLink className="reader__post-title-link" href={ post.URL } target="_blank" icon={ false }>
							{ post.title }
						</ExternalLink>
					</h1>
					: null }

				<ul className="story-header__byline">
					<li className="story-header__byline-author">
						<AuthorLink post={ post }>{ get( post, 'author.name' ) }</AuthorLink>,&nbsp;
						<SiteLink post={ post }>{ siteName }</SiteLink>
					</li>
					{ post.date && post.URL /* @todo class names need fixing */
						? <li className="reader-post-byline__date">
							<a className="reader-post-byline__date-link"
								onClick={ onDateClick }
								href={ post.URL }
								target="_blank">
								<PostTime date={ post.date } />
							</a>
						</li>
					: null }
				</ul>
			</div>
		</div>
	);
};

export default StoryHeader;
