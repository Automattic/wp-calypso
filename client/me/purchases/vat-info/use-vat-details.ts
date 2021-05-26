/**
 * External dependencies
 */
import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export interface VatDetails {
	country?: string | null;
	id?: string | null;
	name?: string | null;
	address?: string | null;
}

type SetVatDetails = ( vatDetails: VatDetails ) => void;

interface VatDetailsManager {
	vatDetails: VatDetails;
	isLoading: boolean;
	error: Error | null;
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
	const mutation = useMutation< VatDetails, Error, VatDetails >( setVatDetails, {
		onSuccess: ( data ) => {
			queryClient.setQueryData( 'vat-details', data );
		},
	} );
	const setDetails = useCallback(
		( vatDetails: VatDetails ) => {
			mutation.mutate( vatDetails );
		},
		[ mutation ]
	);

	return useMemo(
		() => ( {
			vatDetails: query.data ?? emptyVatDetails,
			isLoading: query.isLoading || mutation.isLoading,
			error: query.error || mutation.error,
			setVatDetails: setDetails,
		} ),
		[ query, setDetails, mutation ]
	);
}
