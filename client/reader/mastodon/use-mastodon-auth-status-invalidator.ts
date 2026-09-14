import { mastodonAuthStatusQueryOptions } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { MastodonError } from '@automattic/api-core';

/**
 * Subscribes to the Mastodon query cache; when a Mastodon query errors
 * with kind `auth_required`, invalidates the auth-status query for the
 * given connection so the gate refetches and re-renders.
 *
 * Mount this once per per-connection view (e.g. MastodonAccountView).
 * It's a no-op when nothing throws auth_required.
 *
 * Mutation-cache subscription is intentionally omitted: classifyAtmosphereError
 * also produces `kind: 'auth_required'`, and mutations don't carry a queryKey
 * to disambiguate by protocol. A Mastodon mutation that fails with
 * `auth_required` typically triggers a query refetch downstream (e.g. via the
 * caller's onError), and that refetch lands here through the query branch
 * with the right key.
 */
export function useMastodonAuthStatusInvalidator( connectionId: number | null ) {
	const queryClient = useQueryClient();

	useEffect( () => {
		// Don't subscribe until we have a real connection id. Avoids materializing
		// a query at the sentinel `null`/`0` key that would never fire.
		if ( connectionId === null || connectionId <= 0 ) {
			return;
		}

		const queryCache = queryClient.getQueryCache();

		const isMastodonKey = ( key: readonly unknown[] ) =>
			key[ 0 ] === 'reader' && key[ 1 ] === 'mastodon';

		const isAuthRequired = ( error: unknown ): error is MastodonError =>
			typeof error === 'object' &&
			error !== null &&
			( error as { kind?: unknown } ).kind === 'auth_required';

		const unsubQuery = queryCache.subscribe( ( evt ) => {
			if ( evt.type !== 'updated' ) {
				return;
			}
			if ( evt.action.type !== 'error' ) {
				return;
			}
			if ( ! isMastodonKey( evt.query.queryKey ) ) {
				return;
			}
			if ( isAuthRequired( evt.action.error ) ) {
				// Fire and forget: invalidateQueries returns a Promise that resolves
				// when the triggered refetch settles. Swallow rejections so a transient
				// auth-status fetch failure inside the subscriber doesn't surface as an
				// unhandled rejection.
				queryClient
					.invalidateQueries( {
						queryKey: mastodonAuthStatusQueryOptions( connectionId ).queryKey,
					} )
					.catch( () => {} );
			}
		} );

		return () => {
			unsubQuery();
		};
	}, [ connectionId, queryClient ] );
}
