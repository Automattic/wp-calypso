import { useStarterDesignsQuery } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from 'react-query';
import type { Design } from '@automattic/design-picker';

/**
 * This query isn't really a query, it's just meant to use Calypso's react-query async storage to store the order for the user forever
 *
 * @param length the length of the array to order
 * @returns an array of numbers in a random order
 */
function useOrder( length: number ) {
	return useQuery(
		[ 'ptk/order', length ],
		async () => {
			const indices = Array.from( { length }, ( _, i ) => i );
			const firstFour = indices.slice( 0, 4 ).sort( () => Math.random() - 0.5 );
			const theRest = indices.slice( 4 );
			return [ ...firstFour, ...theRest ];
		},
		{
			staleTime: Infinity,
			enabled: length > 0,
		}
	);
}

export const useLinkInBioDesigns = (): Design[] => {
	const queryResult = useStarterDesignsQuery( {
		_locale: useLocale(),
	} );

	let designs = queryResult.data
		? queryResult.data.designs.filter(
				( design ) =>
					design.is_virtual &&
					design.categories.some( ( category ) => category.slug === 'link-in-bio' )
		  )
		: [];

	const { data: order } = useOrder( designs.length );

	if ( designs.length && order ) {
		designs = order.map( ( index ) => designs[ index ] );
	}

	return designs;
};
