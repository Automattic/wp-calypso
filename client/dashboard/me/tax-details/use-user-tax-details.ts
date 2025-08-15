import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import wpcom from 'calypso/lib/wp';
import type { UserTaxDetails } from '../../data/types';

export type SetUserTaxDetails = ( userTaxDetails: UserTaxDetails ) => Promise< UserTaxDetails >;

export interface UpdateError {
	message: string;
	error: string;
}

export interface FetchError {
	message: string;
	error: string;
}

export interface UserTaxDetailsManager {
	userTaxDetails: UserTaxDetails;
	isLoading: boolean;
	isUpdating: boolean;
	isUpdateSuccessful: boolean;
	fetchError: FetchError | null;
	updateError: UpdateError | null;
	setUserTaxDetails: SetUserTaxDetails;
}

async function fetchUserTaxDetails(): Promise< UserTaxDetails > {
	return await wpcom.req.get( '/me/vat-info' );
}

async function setUserTaxDetails( userTaxDetails: UserTaxDetails ): Promise< UserTaxDetails > {
	return await wpcom.req.post( {
		path: '/me/vat-info',
		body: userTaxDetails,
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

const emptyUserTaxDetails = {};

export default function useUserTaxDetails(): UserTaxDetailsManager {
	const queryClient = useQueryClient();
	const query = useQuery< UserTaxDetails, FetchError >( {
		queryKey: [ 'vat-details' ],
		queryFn: fetchUserTaxDetails,
	} );
	const mutation = useMutation< UserTaxDetails, UpdateError, UserTaxDetails >( {
		mutationFn: setUserTaxDetails,
		onSuccess: ( data ) => {
			queryClient.setQueryData( [ 'vat-details' ], data );
		},
	} );
	const formatUserTaxDetails = useCallback( ( data: UserTaxDetails ) => {
		const { country, id } = data;

		if ( !! id && id?.length > 1 ) {
			return { ...data, id: stripCountryCodeFromVatId( id, country ) };
		}

		return data;
	}, [] );
	const setDetails = useCallback(
		( userTaxDetails: UserTaxDetails ) => {
			return mutation.mutateAsync( formatUserTaxDetails( userTaxDetails ) );
		},
		[ mutation, formatUserTaxDetails ]
	);

	return useMemo(
		() => ( {
			userTaxDetails: query.data ?? emptyUserTaxDetails,
			isLoading: query.isLoading,
			isUpdating: mutation.isPending,
			isUpdateSuccessful: mutation.isSuccess,
			fetchError: query.error,
			updateError: mutation.error,
			setUserTaxDetails: setDetails,
		} ),
		[ query, setDetails, mutation ]
	);
}
