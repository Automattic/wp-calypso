import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { transferStates, TransferStates } from 'calypso/state/automated-transfer/constants';
import { SiteSlug } from 'calypso/types';

interface SuccessResponse {
	status: TransferStates;
}

const fetchLatestAtomicTransfer = ( siteSlug: SiteSlug ): Promise< SuccessResponse > =>
	wpcom.req.get( {
		path: `/sites/${ siteSlug }/atomic/transfers/latest`,
		apiNamespace: 'wpcom/v2',
	} );

interface UseAtomicTransferQueryOptions {
	refetchInterval?: number;
}

const endStates: TransferStates[] = [
	transferStates.NONE,
	transferStates.COMPLETE,
	transferStates.COMPLETED,
	transferStates.FAILURE,
	transferStates.ERROR,
	transferStates.REVERTED,
];

export function useAtomicTransferQueryQueryKey( siteSlug: string ) {
	return [ 'sites', siteSlug, 'atomic', 'transfers', 'latest' ];
}

export const useAtomicTransferQuery = (
	siteSlug: SiteSlug,
	{ refetchInterval }: UseAtomicTransferQueryOptions
) => {
	const { data, failureReason } = useQuery( {
		queryKey: useAtomicTransferQueryQueryKey( siteSlug ),
		queryFn: () => fetchLatestAtomicTransfer( siteSlug ),
		refetchInterval,
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

	const { status } = data as SuccessResponse;

	return {
		transferStatus: status,
		isTransferring: ! endStates.includes( status ),
	};
};
