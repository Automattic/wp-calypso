/**
 * External dependencies
 */
import React from 'react';
import { get, includes } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import * as stats from 'reader/stats';

const authorNameBlacklist = [ 'admin' ];

const ReaderAuthorLink = ( { author, post, siteUrl, children, className } ) => {
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

	const authorName = get( author, 'name', null );

	// If the author name is blacklisted, don't return anything
	if ( ! authorName || includes( authorNameBlacklist, authorName.toLowerCase() ) ) {
		return null;
	}

	const classes = classnames( 'reader-author-link', className );

	// If we have neither author.URL or siteUrl, just return children in a wrapper
	if ( ! siteUrl ) {
		return ( <span className={ classes }>{children}</span> );
	}

	return (
		<a className={ classes } href={ siteUrl } onClick={ recordAuthorClick }>
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
