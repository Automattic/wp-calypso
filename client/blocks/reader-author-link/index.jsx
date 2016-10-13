/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

const ReaderAuthorLink = ( { author, post, siteUrl, children } ) => {
	const recordAuthorClick = ( { } ) => {
		recordAction( 'click_author' );
		recordGaEvent( 'Clicked Author Link' );
		if ( post ) {
			recordTrackForPost( 'calypso_reader_author_link_clicked', post );
		}
	};

	if ( ! siteUrl ) {
		siteUrl = author.URL;
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
