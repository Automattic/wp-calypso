import { isWpError } from '@automattic/api-core';
import { captureException } from '@automattic/calypso-sentry';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { bumpMultipleStats } from '../analytics';

export default function MutationErrorTracker() {
	const queryClient = useQueryClient();

	useEffect( () => {
		return queryClient.getMutationCache().subscribe( ( event ) => {
			if ( event.type !== 'updated' || event.action.type !== 'error' ) {
				return;
			}

			const { mutation } = event;
			const error = event.action.error;

			const statId = mutation.meta?.statId;

			// Every api-queries mutation is annotated, so a missing ID means an unannotated
			// mutation defined elsewhere — a gap in the stats worth fixing at the source.
			if ( statId === undefined ) {
				captureException( new Error( 'Failed mutation is missing a meta.statId property' ), {
					extra: {
						mutation_key: mutation.options.mutationKey ?? null,
						error_message: error instanceof Error ? error.message : String( error ),
						error_status: isWpError( error ) ? error.status : null,

						// Stack may help us track down which mutation this is.
						error_stack: error instanceof Error ? error.stack : null,
					},
				} );
			}

			const value = statId ?? 'missing';
			const stats = [] as [ string, string ][];

			stats.push( [ 'dashboard-mutation-error', value ] );

			if ( ! isWpError( error ) ) {
				// Not a network error response. Could be a logic bug, but could equally be a
				// user-driven failure (a declined browser permission, a cancelled WebAuthn
				// prompt), so monitor the rate rather than reporting each one to Sentry.
				stats.push( [ 'dashboard-mutation-error-other', value ] );
			} else {
				// Groups mutation failures with their error code e.g. `domain-dnssec-update.401`
				stats.push( [ 'dashboard-mutation-error-status', `${ value }.${ error.status }` ] );

				if ( error.status >= 400 && error.status < 500 ) {
					stats.push( [ 'dashboard-mutation-error-4xx', value ] );
				} else if ( error.status >= 500 && error.status < 600 ) {
					stats.push( [ 'dashboard-mutation-error-5xx', value ] );
				}
			}

			bumpMultipleStats( ...stats );
		} );
	}, [ queryClient ] );

	return null;
}
