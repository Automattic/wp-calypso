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
		const [ slug, quantityStr ] = i.split( ':', 2 );

		const quantity = parseInt( quantityStr, 10 );
		if ( Number.isNaN( quantity ) ) {
			return { slug, quantity: 1 };
		}

		return { slug, quantity };
	} );
};
