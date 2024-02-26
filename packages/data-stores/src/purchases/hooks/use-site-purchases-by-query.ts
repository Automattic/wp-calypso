import { useMemo } from '@wordpress/element';
import useSitePurchases, { PurchasesIndex } from '../queries/use-site-purchases';
import { Purchase } from '../types';

interface Props {
	query: Partial< Purchase >;
	siteId?: string | number | null;
}

const useSitePurchasesByQuery = ( { siteId, query }: Props ): PurchasesIndex | undefined => {
	const sitePurchases = useSitePurchases( { siteId } );

	const matches = useMemo( () => {
		return Object.fromEntries(
			Object.entries( sitePurchases?.data ?? {} ).filter( ( [ , purchase ] ) =>
				Object.entries( query ).every( ( [ key, value ] ) => purchase[ key ] === value )
			)
		);
	}, [ sitePurchases.data, query ] );

	return Object.keys( matches ).length === 0 ? undefined : matches;
};

export default useSitePurchasesByQuery;
