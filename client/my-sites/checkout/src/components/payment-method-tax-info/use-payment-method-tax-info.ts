import { setPaymentMethodTaxInfo } from '@automattic/api-core';
import { userPaymentMethodTaxInfoQuery } from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { TaxGetInfo, TaxInfo } from './types';

/**
 * The endpoint takes the `tax_`-prefixed shape, but `setPaymentMethodTaxInfo`
 * accepts the unprefixed shape a payment method carries and prefixes it itself.
 */
function asStoredTaxLocation( taxInfo: TaxInfo ) {
	return {
		postal_code: taxInfo.tax_postal_code,
		country_code: taxInfo.tax_country_code,
		subdivision_code: taxInfo.tax_subdivision_code,
		city: taxInfo.tax_city,
		organization: taxInfo.tax_organization,
		address: taxInfo.tax_address,
	};
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

	const { queryKey } = userPaymentMethodTaxInfoQuery( storedDetailsId );

	const { data: taxInfo, isLoading } = useQuery( {
		...userPaymentMethodTaxInfoQuery( storedDetailsId ),
		enabled: ! doNotFetch,
	} );

	const { mutate: setTaxInfoMutate } = useMutation( {
		mutationFn: ( mutationInputValues: TaxInfo ) =>
			setPaymentMethodTaxInfo( storedDetailsId, asStoredTaxLocation( mutationInputValues ) ),
		onSuccess: ( _data, onSuccessInputValues: TaxInfo ) => {
			queryClient.setQueryData( queryKey, {
				...onSuccessInputValues,
				is_tax_info_set: true,
			} );
		},
	} );

	const setTaxInfo = useCallback(
		( newInfo: TaxInfo ): Promise< void > => {
			return new Promise( ( resolve, reject ) => {
				setTaxInfoMutate( newInfo, {
					onSuccess: () => resolve(),
					onError: ( error ) => reject( ( error as Error ).message ),
				} );
			} );
		},
		[ setTaxInfoMutate ]
	);

	return {
		taxInfo,
		isLoading: doNotFetch ? false : isLoading,
		setTaxInfo,
	};
}
