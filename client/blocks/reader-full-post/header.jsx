/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { keys, trim } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import AutoDirection from 'calypso/components/auto-direction';
import ExternalLink from 'calypso/components/external-link';
import { recordPermalinkClick } from 'calypso/reader/stats';
import TimeSince from 'calypso/components/time-since';
import ReaderFullPostHeaderTags from './header-tags';
import { isDiscoverPost } from 'calypso/reader/discover/helper';
import ReaderFullPostHeaderPlaceholder from './placeholders/header';

const ReaderFullPostHeader = ( { post, referralPost } ) => {
	const handlePermalinkClick = ( {} ) => {
		recordPermalinkClick( 'full_post_title', post );
	};

	const recordDateClick = () => {
		recordPermalinkClick( 'timestamp_full_post', post );
	};

	const classes = { 'reader-full-post__header': true };
	if ( ! post.title || trim( post.title ).length < 1 ) {
		classes[ 'is-missing-title' ] = true;
	}

	const externalHref = isDiscoverPost( referralPost ) ? referralPost.URL : post.URL;

	if ( ! post || post._state === 'pending' ) {
		return <ReaderFullPostHeaderPlaceholder />;
	}

	/* eslint-disable react/jsx-no-target-blank */
	return (
		<div className={ classNames( classes ) }>
			{ post.title ? (
				<AutoDirection>
					<h1 className="reader-full-post__header-title">
						<ExternalLink
							className="reader-full-post__header-title-link"
							href={ externalHref }
							target="_blank"
							icon={ false }
							onClick={ handlePermalinkClick }
						>
							{ post.title }
						</ExternalLink>
					</h1>
				</AutoDirection>
			) : null }
			<div className="reader-full-post__header-meta">
				{ post.date ? (
					<span className="reader-full-post__header-date">
						<a
							className="reader-full-post__header-date-link"
							onClick={ recordDateClick }
							href={ externalHref }
							target="_blank"
							rel="noopener noreferrer"
						>
							<TimeSince date={ post.date } />
						</a>
					</span>
				) : null }

				{ post.tags && keys( post.tags ).length > 0 ? (
					<div className="reader-full-post__header-tags">
						<Gridicon icon="tag" size={ 18 } />
						<ReaderFullPostHeaderTags tags={ post.tags } />
					</div>
				) : null }
			</div>
		</div>
	);
	/* eslint-enable react/jsx-no-target-blank */
};

ReaderFullPostHeader.propTypes = {
	post: PropTypes.object.isRequired,
	referralPost: PropTypes.object,
};

export default ReaderFullPostHeader;
