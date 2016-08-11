/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

const ReaderAuthorLink = ( { author, post, children } ) => {
	const recordAuthorClick = ( { } ) => {
		recordAction( 'click_author' );
		recordGaEvent( 'Clicked Author Link' );
		if ( post ) {
			recordTrackForPost( 'calypso_reader_author_link_clicked', post );
		}
	};

	if ( ! author.URL ) {
		return ( <span>{ children }</span> );
	}

	return (
		<ExternalLink href={ author.URL } target="_blank" onClick={ recordAuthorClick }>
			{ children }
		</ExternalLink>
	);
};

ReaderAuthorLink.propTypes = {
	author: React.PropTypes.object.isRequired,
	post: React.PropTypes.object // for stats only
};

export default ReaderAuthorLink;
