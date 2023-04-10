import { find } from 'lodash';

export const shortEnough = ( limit ) => ( title ) => title.length <= limit ? title : false;

export const truncatedAtSpace = ( lower, upper ) => ( fullTitle ) => {
	const title = fullTitle.slice( 0, upper );
	const lastSpace = title.lastIndexOf( ' ' );

	return lastSpace > lower && lastSpace < upper ? title.slice( 0, lastSpace ).concat( '…' ) : false;
};

export const hardTruncation = ( limit ) => ( title ) => title.slice( 0, limit ).concat( '…' );

export const firstValid =
	( ...predicates ) =>
	( a ) =>
		find( predicates, ( p ) => false !== p( a ) )( a );

export const stripHtmlTags = ( description ) =>
	description ? description.replace( /(<([^>]+)>)/gi, '' ) : '';

export const formatTweetDate = new Intl.DateTimeFormat( 'en-US', {
	// Result: "Apr 7", "Dec 31"
	month: 'short',
	day: 'numeric',
} ).format;
