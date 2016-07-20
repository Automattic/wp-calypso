/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

const AuthorLink = ( { post, children } ) => {
	const recordAuthorClick = ( { post } ) => {
		recordAction( 'click_author' );
		recordGaEvent( 'Clicked Author Link' );
		recordTrackForPost( 'calypso_reader_author_link_clicked', post );
	};

	if ( ! post.author.URL ) {
		return ( <span>{ children }</span> );
	}

	return (
		<ExternalLink href={ post.author.URL } target="_blank" onClick={ recordAuthorClick }>
			{ children }
		</ExternalLink>
	);
};

export default AuthorLink;
