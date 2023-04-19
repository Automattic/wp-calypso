export type Formatter = ( text: string, options?: any ) => string;
type AugmentFormatterReturnType< T extends Formatter, TNewReturn > = (
	...a: Parameters< T >
) => ReturnType< T > | TNewReturn;
type ConditionalFormatter = AugmentFormatterReturnType< Formatter, boolean >;
type NullableFormatter = AugmentFormatterReturnType< Formatter, undefined >;
type DateFormatter = ( arg0: Date ) => string;

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

export const formatTweetDate: DateFormatter = new Intl.DateTimeFormat( 'en-US', {
	// Result: "Apr 7", "Dec 31"
	month: 'short',
	day: 'numeric',
} ).format;
