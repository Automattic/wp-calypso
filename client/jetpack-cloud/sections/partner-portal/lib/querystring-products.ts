import { type IssueLicenseRequest } from '../hooks/use-issue-licenses';

export const serializeQueryStringProducts = ( products: IssueLicenseRequest[] ): string => {
	return products.map( ( { slug, quantity } ) => `${ slug }:${ quantity }` ).join( ',' );
};

export const parseQueryStringProducts = (
	products: string | null | undefined
): IssueLicenseRequest[] => {
	if ( ! products ) {
		return [];
	}

	const commaSeparated = products.split( ',' );
	return commaSeparated.map( ( i ) => {
		const colonSeparatedItem = i.split( ':' );
		const quantity = parseInt( colonSeparatedItem[ 1 ] ?? 1, 10 );
		const slug = colonSeparatedItem[ 0 ];

		return { slug, quantity };
	} );
};
