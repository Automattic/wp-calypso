import { hydrate, QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { throttle } from 'lodash';
import { shouldPersist, MAX_AGE, SERIALIZE_THROTTLE } from 'calypso/state/initial-state';
import {
	getPersistedStateItem,
	loadPersistedState,
	storePersistedStateItem,
} from 'calypso/state/persisted-state';
import { shouldDehydrateQuery } from './should-dehydrate-query';

export async function createQueryClient( userId?: number ): Promise< QueryClient > {
	await loadPersistedState();
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { gcTime: MAX_AGE } },
	} );
	await hydrateBrowserState( queryClient, userId );
	return queryClient;
}

export async function hydrateBrowserState(
	queryClient: QueryClient,
	userId: number | undefined
): Promise< void > {
	if ( shouldPersist() ) {
		const storeKey = `query-state-${ userId ?? 'logged-out' }`;
		const persister = {
			persistClient: throttle(
				( state ) => storePersistedStateItem( storeKey, state ),
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
