import { isWpError } from '@automattic/api-core';
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

			// Most mutations are not annotated yet, so a missing ID is expected rather
			// than a fault worth reporting.
			const value = mutation.meta?.statId ?? 'missing';
			const stats = [] as [ string, string ][];

			stats.push( [ 'dashboard-mutation-error', value ] );

			if ( ! isWpError( error ) ) {
				// Not a network error response. Could be a logic bug, but could equally be a
				// user-driven failure (a declined browser permission, a cancelled WebAuthn
				// prompt), so monitor the rate rather than reporting each one to Sentry.
				stats.push( [ 'dashboard-mutation-error-other', value ] );
			} else {
				// Groups mutation failures with their error code e.g. `domain-dnssec-mut.401`
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
