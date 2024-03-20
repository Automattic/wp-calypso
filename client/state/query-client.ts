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
	removePersistedStateItem,
} from 'calypso/state/persisted-state';
import { shouldDehydrateQuery } from './should-dehydrate-query';
import type { DebouncedFunc } from '@wordpress/compose';

type ThrotthledPersister = {
	persistClient: DebouncedFunc< ( state: PersistedClient ) => Promise< unknown > >;
} & Omit< Persister, 'persistClient' >;
type HydrateBrowserStateReturn = {
	persister?: ThrotthledPersister;
	unsubscribePersister: () => void;
	removePersistedState: () => void;
};
type CreateQueryClientReturn = {
	queryClient: QueryClient;
	unsubscribePersister: () => void;
	removePersistedState: () => void;
};

let hasUnsubscribedFromPersister = false;

export async function createQueryClient( userId?: number ): Promise< CreateQueryClientReturn > {
	await loadPersistedState();
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { gcTime: MAX_AGE } },
	} );
	const { persister, unsubscribePersister, removePersistedState } = await hydrateBrowserState(
		queryClient,
		userId
	);

	if ( typeof window !== 'undefined' ) {
		// Persist the cache to local storage before the browser is unloaded
		window.addEventListener( 'beforeunload', () => {
			if ( persister && shouldPersist() && ! hasUnsubscribedFromPersister ) {
				// flush the debouncer so the next persist is immediate
				persister.persistClient.flush();
				persistQueryClient( { queryClient, persister: persister as unknown as Persister } );
			}
		} );
	}

	const unsubscribePersisterWrapper = () => {
		// because we create a new persistQueryClient for the beforeunload we need a way to track the unsubscribe from
		// the regular persistQueryClient so we don't persist on beforeunload when unsubscribed
		hasUnsubscribedFromPersister = true;
		unsubscribePersister();
	};

	return { queryClient, unsubscribePersister: unsubscribePersisterWrapper, removePersistedState };
}

export async function hydrateBrowserState(
	queryClient: QueryClient,
	userId: number | undefined
): Promise< HydrateBrowserStateReturn > {
	if ( shouldPersist() ) {
		const storeKey = `query-state-${ userId ?? 'logged-out' }`;
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
		const [ unsubscribePersister ] = persistQueryClient( {
			queryClient,
			persister,
			maxAge: MAX_AGE,
			dehydrateOptions: {
				shouldDehydrateQuery,
			},
		} );

		const removePersistedState = () => {
			removePersistedStateItem( storeKey );
		};

		return { persister, unsubscribePersister, removePersistedState };
	}

	return { unsubscribePersister: () => {}, removePersistedState: () => {} };
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
