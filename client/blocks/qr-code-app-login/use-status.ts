import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { Status } from './types';

const POLL_INTERVAL_MS = 2000;

const TERMINAL_STATUSES: Status[ 'status' ][] = [ 'consumed', 'expired' ];

export function useStatus( token: string | undefined, isVisible = true ) {
	return useQuery< Status >( {
		queryKey: [ 'qr-code-app-login-status', token ],
		queryFn: () =>
			wp.req.get( { path: '/auth/qr-code-app/status', apiNamespace: 'wpcom/v2' }, { token } ),
		enabled: !! token,
		refetchInterval: ( query ) => {
			if ( ! isVisible ) {
				return false;
			}
			const status = query.state.data?.status;
			if ( status && TERMINAL_STATUSES.includes( status ) ) {
				return false;
			}
			return POLL_INTERVAL_MS;
		},
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: 'always',
		// Always treat status as fresh-only — never serve cached values.
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: 'always',
		meta: { persist: false },
	} );
}
