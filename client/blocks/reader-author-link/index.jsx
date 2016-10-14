/**
 * External dependencies
 */
import React from 'react';
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import * as stats from 'reader/stats';

const ReaderAuthorLink = ( { author, post, siteUrl, children } ) => {
	const recordAuthorClick = ( { } ) => {
		stats.recordAction( 'click_author' );
		stats.recordGaEvent( 'Clicked Author Link' );
		if ( post ) {
			stats.recordTrackForPost( 'calypso_reader_author_link_clicked', post );
		}
	};

	if ( ! siteUrl ) {
		siteUrl = author.URL;
	}

	const authorName = get( author, 'name' );
	const authorNameBlacklist = [ 'admin' ];

	// If the author name is blacklisted, don't return anything
	if ( typeof authorName === 'string' && includes( authorNameBlacklist, author.name.toLowerCase() ) ) {
		return null;
	}

	// If we have neither author.URL or siteUrl, just return children
	if ( ! siteUrl ) {
		return children;
	}

	return (
		<a className="reader-author-link" href={ siteUrl } onClick={ recordAuthorClick }>
			{ children }
		</a>
	);
};

ReaderAuthorLink.propTypes = {
	author: React.PropTypes.object.isRequired,
	post: React.PropTypes.object, // for stats only,
	siteUrl: React.PropTypes.string // used instead of author.URL if present
};

export default ReaderAuthorLink;
