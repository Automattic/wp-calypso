import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { VatDetails } from '@automattic/wpcom-checkout';

export type SetVatDetails = ( vatDetails: VatDetails ) => Promise< VatDetails >;

export interface UpdateError {
	message: string;
	error: string;
}

export interface VatDetailsManager {
	vatDetails: VatDetails;
	isLoading: boolean;
	isUpdating: boolean;
	isUpdateSuccessful: boolean;
	fetchError: Error | null;
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

const emptyVatDetails = {};

export default function useVatDetails(): VatDetailsManager {
	const queryClient = useQueryClient();
	const query = useQuery< VatDetails, Error >( 'vat-details', fetchVatDetails );
	const mutation = useMutation< VatDetails, UpdateError, VatDetails >( setVatDetails, {
		onSuccess: ( data ) => {
			queryClient.setQueryData( 'vat-details', data );
		},
	} );
	const formatVatDetails = useCallback( ( data: VatDetails ) => {
		const { country, id } = data;

		if ( !! id && id?.length > 1 ) {
			const first2UppercasedChars = id.slice( 0, 2 ).toUpperCase();

			if ( isNaN( Number( first2UppercasedChars ) ) && first2UppercasedChars === country ) {
				return { ...data, id: id.slice( 2 ) };
			}
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
			isUpdating: mutation.isLoading,
			isUpdateSuccessful: mutation.isSuccess,
			fetchError: query.error,
			updateError: mutation.error,
			setVatDetails: setDetails,
		} ),
		[ query, setDetails, mutation ]
	);
}
