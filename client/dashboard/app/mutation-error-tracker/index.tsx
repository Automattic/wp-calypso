import { isWpError } from '@automattic/api-core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { bumpStat } from '../analytics';

export default function MutationErrorTracker() {
	const queryClient = useQueryClient();

	useEffect( () => {
		return queryClient.getMutationCache().subscribe( ( event ) => {
			if ( event.type !== 'updated' || event.action.type !== 'error' ) {
				return;
			}

			const { mutation } = event;
			const error = event.action.error;
			const trackingId = mutation.meta?.trackingId;

			if ( ! trackingId ) {
				return;
			}

			// Only track server-side errors now.
			if ( ! isWpError( error ) || Math.floor( error.status / 100 ) !== 5 ) {
				return;
			}

			bumpStat( 'dashboard-mutation-error', trackingId );
		} );
	}, [ queryClient ] );

	return null;
}
