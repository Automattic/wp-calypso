import { mastodonAuthStatusQueryOptions } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { MastodonError } from '@automattic/api-core';

/**
 * Subscribes to the Mastodon query and mutation caches; when any of them
 * emits an error of kind `auth_required`, invalidates the auth-status
 * query for the given connection so the gate refetches and re-renders.
 *
 * Mount this once per per-connection view (e.g. MastodonAccountView).
 * It's a no-op when nothing throws auth_required.
 */
export function useMastodonAuthStatusInvalidator( connectionId: number ) {
	const queryClient = useQueryClient();

	useEffect( () => {
		const queryCache = queryClient.getQueryCache();
		const mutationCache = queryClient.getMutationCache();

		const isMastodonKey = ( key: readonly unknown[] ) =>
			key[ 0 ] === 'reader' && key[ 1 ] === 'mastodon';

		const invalidate = () => {
			queryClient.invalidateQueries( {
				queryKey: mastodonAuthStatusQueryOptions( connectionId ).queryKey,
			} );
		};

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
				invalidate();
			}
		} );

		const unsubMutation = mutationCache.subscribe( ( evt ) => {
			if ( evt.type !== 'updated' ) {
				return;
			}
			if ( evt.action.type !== 'error' ) {
				return;
			}
			// Mutations don't carry a queryKey; gate by the error shape alone.
			// classifyMastodonError is the only producer of these kinds, so an
			// auth_required from a mutation is mastodon-or-atmosphere. Mounting
			// this hook only inside MastodonAccountView keeps the false-positive
			// surface to nothing the user observes — at worst we invalidate
			// auth-status during an atmosphere mutation that fires while the
			// user is inside MastodonAccountView, which just triggers an extra
			// cheap auth-status refetch.
			if ( isAuthRequired( evt.action.error ) ) {
				invalidate();
			}
		} );

		return () => {
			unsubQuery();
			unsubMutation();
		};
	}, [ connectionId, queryClient ] );
}
