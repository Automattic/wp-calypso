import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useRef } from 'react';
import wpcom from 'calypso/lib/wp';
import { transferStates, type TransferStates } from 'calypso/state/automated-transfer/constants';

// The endpoint returns HTTP status 200 with a JSON body with status 404 when the transfer was not initiated.
type TransferState = TransferStates;

export type TransferStatusResponse = {
	status: TransferState;
	code?: string;
};

const fetchStatus = ( siteId: number ): Promise< TransferStatusResponse > => {
	return wpcom.req
		.get( {
			path: `/sites/${ siteId }/atomic/transfers/latest`,
			apiNamespace: 'wpcom/v2',
		} )
		.catch( ( error: { message: string; code: string } ) => {
			if ( error?.code === 'no_transfer_record' ) {
				// The processing of the `no_transfer_record` as an error make the query to be refetched infinitely,
				// so I need to return a resolved promise with the status NONE.
				return Promise.resolve( { status: transferStates.NONE } );
			}
			return Promise.reject( error );
		} );
};

const REFETCH_TIME = process.env.NODE_ENV === 'test' ? 300 : 3000;

// A transfer started in another tab shows up within seconds, so watching for one is worth a short
// burst and nothing more. Past it, window focus is the only moment a stale answer matters.
const NONE_WATCH_MS = process.env.NODE_ENV === 'test' ? 6000 : 60 * 1000;

// The same bound the Redux pollers got in DOTCOM-17961/17962: a transfer stuck server-side must not
// poll for the life of the tab.
const TRANSFER_DEADLINE_MS = process.env.NODE_ENV === 'test' ? 30_000 : 5 * 60 * 1000;

const endStates: TransferState[] = [
	transferStates.NONE,
	transferStates.COMPLETE,
	transferStates.COMPLETED,
	transferStates.FAILURE,
	transferStates.ERROR,
	transferStates.REVERTED,
];

const isTransferring = ( status: TransferState ) => {
	return ! endStates.includes( status );
};

const readyToTransferStates: TransferState[] = [ transferStates.NONE, transferStates.REVERTED ];

const isReadyToTransfer = ( status: TransferState ) => {
	return readyToTransferStates.includes( status );
};

export function getSiteTransferStatusQueryKey( siteId: number ) {
	return [ 'sites', siteId, 'atomic', 'transfers', 'latest' ];
}

// Which of the two bounded waits a status belongs to. Grouping by phase rather than raw status
// keeps the deadline running while a live transfer moves through pending → active → provisioned.
type WatchPhase = 'none' | 'transferring';

const watchPhase = ( status: TransferStates | undefined ): WatchPhase | null => {
	if ( ! status ) {
		return null;
	}
	if ( transferStates.NONE === status ) {
		return 'none';
	}
	return isTransferring( status ) ? 'transferring' : null;
};

type Options = Pick< UseQueryOptions, 'retry' >;

/**
 * Query hook to get the site transfer status, pooling the endpoint.
 * @param siteId
 * @returns
 */
export const useSiteTransferStatusQuery = ( siteId: number | undefined, options?: Options ) => {
	// Wall clock rather than a tick count: a throttled background tab would otherwise stretch either
	// bound far past the time it is meant to describe. Keyed by site as well as phase, so switching
	// sites cannot hand the next one an already-spent window.
	const phaseRef = useRef< {
		siteId: number | undefined;
		phase: WatchPhase | null;
		since: number;
	} >( { siteId, phase: null, since: Date.now() } );

	// Before any status arrives there is no window to be inside of, and the first load still needs
	// its retries.
	const isWithinWatchWindow = () => {
		const { phase, since } = phaseRef.current;
		if ( ! phase ) {
			return true;
		}
		return Date.now() - since < ( phase === 'none' ? NONE_WATCH_MS : TRANSFER_DEADLINE_MS );
	};

	return useQuery( {
		queryKey: getSiteTransferStatusQueryKey( siteId! ),
		queryFn: () => fetchStatus( siteId! ),
		// Retries outlive the interval otherwise: a failing endpoint would keep a poll alive well past
		// the bound this hook advertises.
		retry: options?.retry ?? ( ( failureCount ) => isWithinWatchWindow() && failureCount < 20 ),
		select: ( data ) => {
			return {
				isTransferring: data?.status ? isTransferring( data.status as TransferStates ) : false,
				isReadyToTransfer: data?.status
					? isReadyToTransfer( data.status as TransferStates )
					: false,
				completed: data?.status === transferStates.COMPLETED,
				status: data.status,
				error: null,
			};
		},
		// Once an interval has expired this is what still notices a transfer started elsewhere, at the
		// only moment the answer can matter to anyone.
		refetchOnWindowFocus: ( query ) => watchPhase( query.state.data?.status ) !== null,
		refetchInterval: ( { state } ) => {
			const phase = watchPhase( state.data?.status );

			if ( phase !== phaseRef.current.phase || siteId !== phaseRef.current.siteId ) {
				phaseRef.current = { siteId, phase, since: Date.now() };
			}

			return phase && isWithinWatchWindow() ? REFETCH_TIME : false;
		},
		enabled: !! siteId,
	} );
};
