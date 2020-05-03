/**
 * External dependencies
 */

import { find } from 'lodash';

//Mostly copied from Seo Preview

export const shortEnough = ( limit ) => ( title ) => ( title.length <= limit ? title : false) ;

export const truncatedAtSpace = ( lower, upper ) => ( fullTitle ) => {
	const title = fullTitle.slice( 0, upper );
	const lastSpace = title.lastIndexOf( ' ' );

	return lastSpace > lower && lastSpace < upper ? title.slice( 0, lastSpace ).concat( '…' ) : false;
};

export const hardTruncation = ( limit ) => ( title ) => title.slice( 0, limit ).concat( '…' );

export const firstValid = ( ...predicates ) => ( a ) =>
	find( predicates, ( p ) => false !== p( a ) )( a );

export const truncateArticleContent = ( maxCharacters, content ) => {
	if ( content.length <= maxCharacters ) {
		return content;
	}

	const truncated = content.slice( 0, maxCharacters );

	// don't trim off the last word if we truncated at
	// the end of the word
	if ( content[ maxCharacters + 1 ] === ' ' ) {
		return `${ content }…`;
	}

	const lastSpace = truncated.lastIndexOf( ' ' );
	return truncated.slice( 0, lastSpace ).concat( '…' );
};
