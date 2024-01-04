import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { transferStates, TransferStates } from 'calypso/state/automated-transfer/constants';
import { SiteSlug } from 'calypso/types';

interface ErrorResponse {
	code: 'no_transfer_record';
}

interface SuccessResponse {
	status: TransferStates;
}

const fetchLatestAtomicTransfer = (
	siteSlug: SiteSlug
): Promise< ErrorResponse | SuccessResponse > =>
	wpcom.req.get( {
		path: `/sites/${ siteSlug }/atomic/transfers/latest`,
		apiNamespace: 'wpcom/v2',
	} );

interface UseAtomicTransferQueryOptions {
	refetchInterval?: number;
}

export const endStates: TransferStates[] = [
	transferStates.NONE,
	transferStates.COMPLETE,
	transferStates.COMPLETED,
	transferStates.FAILURE,
	transferStates.ERROR,
	transferStates.REVERTED,
];

export function useAtomicTransferQueryQueryKey( siteSlug ) {
	return [ 'sites', siteSlug, 'atomic', 'transfers', 'latest' ];
}

export const useAtomicTransferQuery = (
	siteSlug: SiteSlug,
	{ refetchInterval, enabled }: UseAtomicTransferQueryOptions
) => {
	const { data, failureReason } = useQuery( {
		queryKey: useAtomicTransferQueryQueryKey( siteSlug ),
		queryFn: () => fetchLatestAtomicTransfer( siteSlug ),
		refetchInterval,
		enabled,
	} );

	if ( ! data && ! failureReason ) {
		return {
			isTransferring: false,
			transferStatus: undefined,
		};
	}

	if ( failureReason ) {
		// Will happen for new sites when no transfer exists: a 404 is returned
		// by the API which becomes failureReason in React Query
		return {
			transferStatus: transferStates.NONE,
			isTransferring: false,
		};
	}

	return {
		transferStatus: data.status,
		isTransferring: ! endStates.includes( data.status ),
	};
};
