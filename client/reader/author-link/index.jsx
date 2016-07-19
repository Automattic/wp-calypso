/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
 import ExternalLink from 'components/external-link';
 import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

// @todo make this work like SiteLink - wrapping this.props.children
const AuthorLink = ( { post } ) => {
	const recordAuthorClick = ( { post } ) => {
		recordAction( 'click_author' );
		recordGaEvent( 'Clicked Author Link' );
		recordTrackForPost( 'calypso_reader_author_link_clicked', post );
	};

	const authorName = get( post, 'author.name' );
	if ( ! authorName ) {
		return null;
	}

	const authorNameElement = ( <span className="author-link__author-name">{ authorName }</span> );

	if ( ! post.author.URL ) {
		return authorNameElement;
	}

	return (
		<ExternalLink href={ post.author.URL } target="_blank" onClick={ recordAuthorClick }>
			{ authorNameElement }
		</ExternalLink>
	);
};

export default AuthorLink;
