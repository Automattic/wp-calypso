import { hydrate, QueryClient } from '@tanstack/react-query';
import {
	PersistedClient,
	Persister,
	persistQueryClient,
} from '@tanstack/react-query-persist-client';
import { throttle } from 'lodash';
import { MAX_AGE, SERIALIZE_THROTTLE } from 'calypso/state/constants';
import { shouldPersist } from 'calypso/state/initial-state';
import {
	getPersistedStateItem,
	loadPersistedState,
	storePersistedStateItem,
} from 'calypso/state/persisted-state';
import { shouldDehydrateQuery } from './should-dehydrate-query';
import type { DebouncedFunc } from '@wordpress/compose';

type ThrotthledPersister = {
	persistClient: DebouncedFunc< ( state: PersistedClient ) => Promise< unknown > >;
} & Omit< Persister, 'persistClient' >;
type HydrateBrowserStateReturn = {
	persister?: ThrotthledPersister;
	unsubscribePersister: () => void;
};
type CreateQueryClientReturn = {
	queryClient: QueryClient;
	unsubscribePersister: () => void;
};

export async function createQueryClient(
	persistenceKey?: string | number
): Promise< CreateQueryClientReturn > {
	await loadPersistedState();
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { gcTime: MAX_AGE } },
	} );
	const { persister, unsubscribePersister } = await hydrateBrowserState(
		queryClient,
		persistenceKey
	);

	const handleBeforeUnload = () => {
		if ( persister && shouldPersist() ) {
			// flush the debouncer so the last persist call is run
			persister.persistClient.flush();
		}
	};

	if ( typeof window !== 'undefined' ) {
		// Persist the cache to local storage before the browser is unloaded
		window.addEventListener( 'beforeunload', handleBeforeUnload );
	}

	const unsubscribePersisterWrapper = () => {
		// remove the unload event listener so that we don't persist beforeunload when it's not wanted
		if ( typeof window !== 'undefined' ) {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		}

		unsubscribePersister();
	};

	return { queryClient, unsubscribePersister: unsubscribePersisterWrapper };
}

export async function hydrateBrowserState(
	queryClient: QueryClient,
	persistenceKey: number | string | undefined
): Promise< HydrateBrowserStateReturn > {
	if ( shouldPersist() ) {
		const storeKey = `query-state-${ persistenceKey ?? 'logged-out' }`;
		const persister = {
			persistClient: throttle(
				( state: PersistedClient ) => {
					state.clientState.queries.forEach( ( query ) => {
						if ( typeof query.meta?.persist === 'function' ) {
							query.meta.persist = query.meta.persist( query.state.data );
						}
					} );

					return storePersistedStateItem( storeKey, state );
				},
				SERIALIZE_THROTTLE,
				{ leading: false, trailing: true }
			),
			restoreClient: () => getPersistedStateItem( storeKey ),
			removeClient: () => {
				// not implemented
			},
		};
		const [ unsubscribePersister, restorePromise ] = persistQueryClient( {
			queryClient,
			persister,
			maxAge: MAX_AGE,
			dehydrateOptions: {
				shouldDehydrateQuery,
			},
		} );

		await restorePromise;

		return { persister, unsubscribePersister };
	}

	return { unsubscribePersister: () => {} };
}

export function hydrateServerState( queryClient: QueryClient, dehydratedState?: unknown ): void {
	hydrate( queryClient, dehydratedState );
}

// Retrieve the dehydrated react-query client.
export function getInitialQueryState() {
	if ( typeof window !== 'object' || ! ( window as any ).initialQueryState || ! shouldPersist() ) {
		return null;
	}

	return ( window as any ).initialQueryState;
}
