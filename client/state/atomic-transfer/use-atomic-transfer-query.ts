import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { transferStates, TransferStates } from 'calypso/state/automated-transfer/constants';

interface SuccessResponse {
	status: TransferStates;
}

const fetchLatestAtomicTransfer = ( siteId: number ): Promise< SuccessResponse > =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/atomic/transfers/latest`,
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

export function useAtomicTransferQueryQueryKey( siteId: number ) {
	return [ 'sites', siteId, 'atomic', 'transfers', 'latest' ];
}

export const useAtomicTransferQuery = (
	siteId: number,
	{ refetchInterval }: UseAtomicTransferQueryOptions
) => {
	const { data, failureReason } = useQuery( {
		queryKey: useAtomicTransferQueryQueryKey( siteId ),
		queryFn: () => fetchLatestAtomicTransfer( siteId ),
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
