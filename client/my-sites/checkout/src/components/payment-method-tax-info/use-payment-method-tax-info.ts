import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import type { TaxGetInfo, TaxInfo } from './types';

async function fetchTaxInfoFromServer( storedDetailsId: string ): Promise< TaxGetInfo > {
	return await wpcom.req.get( `/me/payment-methods/${ storedDetailsId }/tax-location` );
}

async function setTaxInfoOnServer( storedDetailsId: string, taxInfo: TaxInfo ): Promise< TaxInfo > {
	return await wpcom.req.post( {
		path: `/me/payment-methods/${ storedDetailsId }/tax-location`,
		body: taxInfo,
	} );
}

export function usePaymentMethodTaxInfo(
	storedDetailsId: string,
	{ doNotFetch }: { doNotFetch?: boolean } = {}
): {
	taxInfo: TaxGetInfo | undefined;
	isLoading: boolean;
	setTaxInfo: ( newInfo: TaxInfo ) => Promise< void >;
} {
	const queryClient = useQueryClient();

	const queryKey = [ 'tax-info-is-set', storedDetailsId ];

	const { data: taxInfo, isLoading } = useQuery< TaxGetInfo, Error >( {
		queryKey,
		queryFn: () => fetchTaxInfoFromServer( storedDetailsId ),
		enabled: ! doNotFetch,
	} );

	const mutation = useMutation( {
		mutationFn: ( mutationInputValues: TaxInfo ) =>
			setTaxInfoOnServer( storedDetailsId, mutationInputValues ),
		onSuccess: ( onSuccessInputValues: TaxInfo ) => {
			queryClient.setQueryData( queryKey, {
				...onSuccessInputValues,
				is_tax_info_set: true,
			} );
		},
	} );

	const setTaxInfo = useCallback(
		( newInfo: TaxInfo ): Promise< void > => {
			return new Promise( ( resolve, reject ) => {
				mutation.mutate( newInfo, {
					onSuccess: () => resolve(),
					onError: ( error ) => reject( ( error as Error ).message ),
				} );
			} );
		},
		[ mutation ]
	);

	return {
		taxInfo,
		isLoading: doNotFetch ? false : isLoading,
		setTaxInfo,
	};
}
