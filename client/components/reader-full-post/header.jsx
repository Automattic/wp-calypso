/**
 * External dependencies
 */
import React from 'react';
import { keys } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { recordPermalinkClick, recordGaEvent } from 'reader/stats';
import PostTime from 'reader/post-time';
import ReaderFullPostHeaderTags from './header-tags';
import Gridicon from 'components/gridicon';

const ReaderFullPostHeader = ( { post } ) => {
	const handlePermalinkClick = ( { } ) => {
		recordPermalinkClick( 'full_post_title' );
	};

	const recordDateClick = ( { } ) => {
		recordPermalinkClick( 'timestamp' );
		recordGaEvent( 'Clicked Post Permalink', 'timestamp' );
	};

	return (
		<div className="reader-full-post__header">
			{ post.title
				? <h1 className="reader-full-post__header-title" onClick={ handlePermalinkClick }>
					<ExternalLink className="reader-full-post__header-title-link" href={ post.URL } target="_blank" icon={ false }>
						{ post.title }
					</ExternalLink>
				</h1>
				: null }
			<div className="reader-full-post__header-meta">
				{ post.date
					? <span className="reader-full-post__header-date">
						<a className="reader-full-post__header-date-link"
							onClick={ recordDateClick }
							href={ post.URL }
							target="_blank">
							<PostTime date={ post.date } />
						</a>
					</span> : null }

				{ post.tags && keys( post.tags ).length > 0
					? <div className="reader-full-post__header-tags">
					<Gridicon icon="tag" size={ 18 } />
					<ReaderFullPostHeaderTags tags={ post.tags } />
				</div> : null }
			</div>
		</div>
	);
};

ReaderFullPostHeader.propTypes = {
	post: React.PropTypes.object.isRequired
};

export default ReaderFullPostHeader;
