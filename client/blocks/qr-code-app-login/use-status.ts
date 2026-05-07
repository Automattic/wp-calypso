import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import wp from 'calypso/lib/wp';
import { logQrAppLoginError } from './log-error';
import { KNOWN_STATUSES, TERMINAL_STATUSES } from './types';
import type { Status } from './types';

const POLL_INTERVAL_MS = 2000;

function isStatus( raw: unknown ): raw is Status {
	if ( ! raw || typeof raw !== 'object' ) {
		return false;
	}
	const status = ( raw as { status?: unknown } ).status;
	return typeof status === 'string' && KNOWN_STATUSES.includes( status as Status[ 'status' ] );
}

export function useStatus( token: string | undefined, isVisible = true ) {
	const result = useQuery< Status, Error >( {
		queryKey: [ 'qr-code-app-login-status', token ],
		queryFn: async () => {
			const data = await wp.req.get(
				{ path: '/auth/qr-code-app/status', apiNamespace: 'wpcom/v2' },
				{ token }
			);
			if ( ! isStatus( data ) ) {
				throw new Error(
					`Unrecognized qr-code-app-login status payload: ${ JSON.stringify( data ) }`
				);
			}
			return data;
		},
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
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: 'always',
		meta: { persist: false },
	} );

	const { error } = result;
	useEffect( () => {
		if ( error ) {
			logQrAppLoginError( 'status', error );
		}
	}, [ error ] );

	return result;
}
