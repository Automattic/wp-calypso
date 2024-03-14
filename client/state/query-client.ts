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

export async function createQueryClient( userId?: number ): Promise< QueryClient > {
	await loadPersistedState();
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { gcTime: MAX_AGE } },
	} );
	const persister = await hydrateBrowserState( queryClient, userId );

	if ( typeof window !== 'undefined' ) {
		// Persist the cache to local storage before the browser is unloaded
		window.addEventListener( 'beforeunload', () => {
			if ( persister ) {
				// cancel any pending throtthled function calls
				persister.persistClient.flush();
				persistQueryClient( { queryClient, persister: persister as unknown as Persister } );
			}
		} );
	}

	return queryClient;
}

export async function hydrateBrowserState(
	queryClient: QueryClient,
	userId: number | undefined
): Promise< ThrotthledPersister | void > {
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
		await persistQueryClient( {
			queryClient,
			persister,
			maxAge: MAX_AGE,
			dehydrateOptions: {
				shouldDehydrateQuery,
			},
		} );

		return persister;
	}
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
