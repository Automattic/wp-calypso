/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

const ReaderAuthorLink = ( { author, children } ) => {
	const recordAuthorClick = ( { } ) => {
		recordAction( 'click_author' );
		recordGaEvent( 'Clicked Author Link' );
		recordTrack( 'calypso_reader_author_link_clicked' );
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
	author: React.PropTypes.object.isRequired
};

export default ReaderAuthorLink;
