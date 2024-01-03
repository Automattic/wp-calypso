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

const endStates: TransferStates[] = [
	transferStates.NONE,
	transferStates.COMPLETE,
	transferStates.COMPLETED,
	transferStates.FAILURE,
	transferStates.ERROR,
	transferStates.REVERTED,
];

export const useAtomicTransferQuery = (
	siteSlug: SiteSlug,
	{ refetchInterval }: UseAtomicTransferQueryOptions
) => {
	const { data } = useQuery( {
		queryKey: [ 'sites', siteSlug, 'atomic', 'transfers', 'latest' ],
		queryFn: () => fetchLatestAtomicTransfer( siteSlug ),
		refetchInterval,
	} );

	if ( ! data ) {
		return {
			isTransferring: false,
			transferStatus: transferStates.NONE,
		};
	}

	if ( 'code' in data ) {
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
