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

export function usePaymentMethodTaxInfo( {
	storedDetailsId,
	onError,
	onSuccess,
}: {
	storedDetailsId: string;
	onError?: ( error: string ) => void;
	onSuccess?: () => void;
} ) {
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
			onMutate: async ( onMutateInputValues: TaxInfo ) => {
				// Stop any active fetches
				await queryClient.cancelQueries( queryKey );
				// Store previous fields so they can be restored if the data is invalid
				const previousData = queryClient.getQueryData( queryKey );
				// Optimistically update the fields
				queryClient.setQueryData( queryKey, {
					tax_postal_code: onMutateInputValues.tax_postal_code,
					tax_country_code: onMutateInputValues.tax_country_code,
					is_tax_info_set: true,
				} );
				return { previousData };
			},
			onError: ( error, _, context ) => {
				// Restore previous fields
				queryClient.setQueryData( queryKey, context?.previousData );
				onError?.( ( error as Error ).message );
			},
			onSuccess: ( onSuccessInputValues: TaxInfo ) => {
				queryClient.setQueryData( queryKey, {
					tax_postal_code: onSuccessInputValues.tax_postal_code,
					tax_country_code: onSuccessInputValues.tax_country_code,
					is_tax_info_set: true,
				} );
				onSuccess?.();
			},
		}
	);

	const setTaxInfo = useCallback(
		( newInfo: TaxInfo ) => {
			mutation.mutate( newInfo );
		},
		[ mutation ]
	);

	return {
		taxInfo,
		isLoading,
		setTaxInfo,
	};
}
