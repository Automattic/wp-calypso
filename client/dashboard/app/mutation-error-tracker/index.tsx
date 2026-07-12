import { isWpError } from '@automattic/api-core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAnalytics } from '../analytics';

// Keep the key's leading string segments; stop at the first non-string, which is a dynamic id.
function mutationKeyLabel( key: unknown ): string | undefined {
	if ( ! Array.isArray( key ) ) {
		return undefined;
	}
	const leading: string[] = [];
	for ( const part of key ) {
		if ( typeof part !== 'string' ) {
			break;
		}
		leading.push( part );
	}
	return leading.length ? leading.join( ':' ) : undefined;
}

/**
 * Records a Tracks event for every failed mutation, from the one place they all
 * pass through — the mutation cache. This gives complete coverage of user-facing
 * action failures without per-feature instrumentation.
 *
 * Only stable, categorical fields are emitted (status, error code, mutation key,
 * whether a snackbar was shown). The error message is never sent — it is localized
 * and may contain customer data. `path` is added automatically by the analytics client.
 */
export default function MutationErrorTracker() {
	const queryClient = useQueryClient();
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		return queryClient.getMutationCache().subscribe( ( event ) => {
			if ( event.type !== 'updated' || event.action.type !== 'error' ) {
				return;
			}

			const { mutation } = event;
			const error = event.action.error;

			const properties: Record< string, unknown > = {
				has_snackbar: Boolean( mutation.meta?.snackbar?.error ),
			};

			const keyLabel = mutationKeyLabel( mutation.options.mutationKey );
			if ( keyLabel ) {
				properties.mutation_key = keyLabel;
			}

			if ( isWpError( error ) ) {
				properties.status = error.status;
				if ( error.error ) {
					properties.error_code = error.error;
				}
			}

			recordTracksEvent( 'calypso_dashboard_mutation_error', properties );
		} );
	}, [ queryClient, recordTracksEvent ] );

	return null;
}
