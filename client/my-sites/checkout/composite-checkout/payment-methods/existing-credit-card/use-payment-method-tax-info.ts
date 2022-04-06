import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { TaxGetInfo, TaxInfo } from './types';

async function fetchTaxInfoFromServer( storedDetailsId: string ): Promise< TaxGetInfo > {
	return await wpcom.req.get( `/me/payment-methods/${ storedDetailsId }/tax-location` );
}

async function setTaxInfoOnServer(
	storedDetailsId: string,
	taxPostalCode: string,
	taxCountryCode: string
): Promise< TaxInfo > {
	return await wpcom.req.post( {
		path: `/me/payment-methods/${ storedDetailsId }/tax-location`,
		body: {
			tax_country_code: taxCountryCode,
			tax_postal_code: taxPostalCode,
		},
	} );
}

export function usePaymentMethodTaxInfo(
	storedDetailsId: string
): {
	taxInfo: TaxGetInfo | undefined;
	isLoading: boolean;
	setTaxInfo: ( newInfo: TaxInfo ) => Promise< void >;
} {
	const queryClient = useQueryClient();

	const queryKey = [ 'tax-info-is-set', storedDetailsId ];

	const { data: taxInfo, isLoading } = useQuery< TaxGetInfo, Error >(
		queryKey,
		() => fetchTaxInfoFromServer( storedDetailsId ),
		{}
	);

	const mutation = useMutation(
		( mutationInputValues: TaxInfo ) =>
			setTaxInfoOnServer(
				storedDetailsId,
				mutationInputValues.tax_postal_code,
				mutationInputValues.tax_country_code
			),
		{
			onMutate: async () => {
				// Stop any active fetches
				await queryClient.cancelQueries( queryKey );
				// Store previous fields so they can be restored if the data is invalid
				const previousData = queryClient.getQueryData( queryKey );
				return { previousData };
			},
			onError: ( error, _, context ) => {
				// Restore previous fields
				queryClient.setQueryData( queryKey, context?.previousData );
			},
			onSuccess: ( onSuccessInputValues: TaxInfo ) => {
				queryClient.setQueryData( queryKey, {
					tax_postal_code: onSuccessInputValues.tax_postal_code,
					tax_country_code: onSuccessInputValues.tax_country_code,
					is_tax_info_set: true,
				} );
			},
		}
	);

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
		isLoading,
		setTaxInfo,
	};
}
