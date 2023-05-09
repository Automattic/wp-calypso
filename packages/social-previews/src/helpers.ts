export type Formatter = ( text: string, options?: any ) => string;
type AugmentFormatterReturnType< T extends Formatter, TNewReturn > = (
	...a: Parameters< T >
) => ReturnType< T > | TNewReturn;
type ConditionalFormatter = AugmentFormatterReturnType< Formatter, boolean >;
type NullableFormatter = AugmentFormatterReturnType< Formatter, undefined >;

export const baseDomain = ( url: string ): string =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

export const shortEnough: ( n: number ) => ConditionalFormatter = ( limit ) => ( title ) =>
	title.length <= limit ? title : false;

export const truncatedAtSpace: ( a: number, b: number ) => ConditionalFormatter =
	( lower, upper ) => ( fullTitle ) => {
		const title = fullTitle.slice( 0, upper );
		const lastSpace = title.lastIndexOf( ' ' );

		return lastSpace > lower && lastSpace < upper
			? title.slice( 0, lastSpace ).concat( '…' )
			: false;
	};

export const hardTruncation: ( n: number ) => Formatter = ( limit ) => ( title ) =>
	title.slice( 0, limit ).concat( '…' );

export const firstValid: ( ...args: ConditionalFormatter[] ) => NullableFormatter =
	( ...predicates ) =>
	( a ) =>
		( predicates.find( ( p ) => false !== p( a ) ) as Formatter )?.( a );

export const stripHtmlTags: Formatter = ( description, allowedTags = [] ) => {
	const pattern = new RegExp( `(<([^${ allowedTags.join( '' ) }>]+)>)`, 'gi' );

	return description ? description.replace( pattern, '' ) : '';
};

export const hasTag = ( text: string, tag: string ): boolean => {
	const pattern = new RegExp( `<${ tag }[^>]*>`, 'gi' );

	return pattern.test( text );
};

export const formatTweetDate = new Intl.DateTimeFormat( 'en-US', {
	// Result: "Apr 7", "Dec 31"
	month: 'short',
	day: 'numeric',
} ).format;

type Platform = 'twitter' | 'facebook' | 'linkedin';

type PreviewTextOptions = {
	platform: Platform;
	maxChars?: number;
	maxLines?: number;
};

/**
 * Prepares the text for the preview.
 */
export function preparePreviewText( text: string, options: PreviewTextOptions ): string {
	const { platform, maxChars, maxLines } = options;

	let result = stripHtmlTags( text );

	if ( maxChars && result.length > maxChars ) {
		result = result.substring( 0, maxChars );
	}

	if ( maxLines ) {
		const lines = result.split( '\n' );

		if ( lines.length > maxLines ) {
			result = lines.slice( 0, maxLines ).join( '\n' );
		}
	}

	// Convert URLs to hyperlinks.
	result = result.replace(
		// TODO: Use a better regex here to match the URLs without protocol.
		/(https?:\/\/\S+)/g,
		'<a href="$1" rel="noopener noreferrer" target="_blank">$1</a>'
	);

	let hashtagUrl;

	if ( 'twitter' === platform ) {
		hashtagUrl = 'https://twitter.com/hashtag/';
	} else if ( 'linkedin' === platform ) {
		hashtagUrl = 'https://www.linkedin.com/feed/hashtag/?keywords=';
	}

	if ( hashtagUrl ) {
		// Convert hashtags to hyperlinks.
		result = result.replace(
			/(^|\s)#(\w+)/g,
			'$1<a href="' + hashtagUrl + '$2" rel="noopener noreferrer" target="_blank">#$2</a>'
		);
	}

	// Convert newlines to <br> tags.
	result = result.replace( /\n/g, '<br/>' );

	return result;
}
