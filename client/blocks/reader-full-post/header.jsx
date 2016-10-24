/**
 * External dependencies
 */
import React from 'react';
import { keys, trim } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { recordPermalinkClick } from 'reader/stats';
import PostTime from 'reader/post-time';
import ReaderFullPostHeaderTags from './header-tags';
import Gridicon from 'components/gridicon';

const ReaderFullPostHeader = ( { post } ) => {
	const handlePermalinkClick = ( { } ) => {
		recordPermalinkClick( 'full_post_title', post );
	};

	const recordDateClick = () => {
		recordPermalinkClick( 'timestamp', post );
	};

	const classes = { 'reader-full-post__header': true };
	if ( ! post.title || trim( post.title ).length < 1 ) {
		classes[ 'is-missing-title' ] = true;
	}

	/* eslint-disable react/jsx-no-target-blank */
	return (
		<div className={ classNames( classes ) }>
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
							target="_blank"
							rel="noopener noreferrer">
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
	/* eslint-enable react/jsx-no-target-blank */
};

ReaderFullPostHeader.propTypes = {
	post: React.PropTypes.object.isRequired
};

export default ReaderFullPostHeader;
