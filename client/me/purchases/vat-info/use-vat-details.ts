import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import wpcom from 'calypso/lib/wp';
import type { VatDetails } from '@automattic/wpcom-checkout';

export type SetVatDetails = ( vatDetails: VatDetails ) => Promise< VatDetails >;

export interface UpdateError {
	message: string;
	error: string;
}

export interface FetchError {
	message: string;
	error: string;
}

export interface VatDetailsManager {
	vatDetails: VatDetails;
	isLoading: boolean;
	isUpdating: boolean;
	isUpdateSuccessful: boolean;
	fetchError: FetchError | null;
	updateError: UpdateError | null;
	setVatDetails: SetVatDetails;
}

async function fetchVatDetails(): Promise< VatDetails > {
	return await wpcom.req.get( '/me/vat-info' );
}

async function setVatDetails( vatDetails: VatDetails ): Promise< VatDetails > {
	return await wpcom.req.post( {
		path: '/me/vat-info',
		body: vatDetails,
	} );
}

// Some countries prefix the VAT ID with the country code, but that's not
// part of the ID as we need it formatted, so here we strip the country
// code out if it is there.
function stripCountryCodeFromVatId( id: string, country: string | undefined | null ): string {
	// Switzerland often uses the prefix 'CHE-' instead of just `CH`.
	const swissCodeRegexp = /^CHE-?/i;
	if ( country === 'CH' && swissCodeRegexp.test( id ) ) {
		return id.replace( swissCodeRegexp, '' );
	}

	const first2UppercasedChars = id.slice( 0, 2 ).toUpperCase();
	if ( first2UppercasedChars === country ) {
		return id.slice( 2 );
	}

	return id;
}

const emptyVatDetails = {};

export default function useVatDetails(): VatDetailsManager {
	const queryClient = useQueryClient();
	const query = useQuery< VatDetails, FetchError >( {
		queryKey: [ 'vat-details' ],
		queryFn: fetchVatDetails,
	} );
	const mutation = useMutation< VatDetails, UpdateError, VatDetails >( {
		mutationFn: setVatDetails,
		onSuccess: ( data ) => {
			queryClient.setQueryData( [ 'vat-details' ], data );
		},
	} );
	const formatVatDetails = useCallback( ( data: VatDetails ) => {
		const { country, id } = data;

		if ( !! id && id?.length > 1 ) {
			return { ...data, id: stripCountryCodeFromVatId( id, country ) };
		}

		return data;
	}, [] );
	const setDetails = useCallback(
		( vatDetails: VatDetails ) => {
			return mutation.mutateAsync( formatVatDetails( vatDetails ) );
		},
		[ mutation, formatVatDetails ]
	);

	return useMemo(
		() => ( {
			vatDetails: query.data ?? emptyVatDetails,
			isLoading: query.isLoading,
			isUpdating: mutation.isPending,
			isUpdateSuccessful: mutation.isSuccess,
			fetchError: query.error,
			updateError: mutation.error,
			setVatDetails: setDetails,
		} ),
		[ query, setDetails, mutation ]
	);
}
