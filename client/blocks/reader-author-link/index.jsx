/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

const ReaderAuthorLink = ( { author, post, siteUrl, children } ) => {
	const recordAuthorClick = ( { } ) => {
		recordAction( 'click_author' );
		recordGaEvent( 'Clicked Author Link' );
		if ( post ) {
			recordTrackForPost( 'calypso_reader_author_link_clicked', post );
		}
	};

	let linkUrl = author.URL;
	if ( ! linkUrl ) {
		linkUrl = siteUrl;
	}

	// If we have neither author.URL or siteUrl, just return children
	if ( ! linkUrl ) {
		return children;
	}

	return (
		<ExternalLink className="reader-author-link" href={ linkUrl } target="_blank" onClick={ recordAuthorClick }>
			{ children }
		</ExternalLink>
	);
};

ReaderAuthorLink.propTypes = {
	author: React.PropTypes.object.isRequired,
	post: React.PropTypes.object, // for stats only,
	siteUrl: React.PropTypes.string // used as fallback if author.URL is missing
};

export default ReaderAuthorLink;
