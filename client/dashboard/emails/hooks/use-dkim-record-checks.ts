import { titanDkimStatusQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { TitanDkimRecord, TitanDkimStatus } from '@automattic/api-core';

export const DKIM_POLL_INTERVAL = 3000;
export const DKIM_POLL_TIMEOUT = 30000;

export type DkimMissingEntry = TitanDkimStatus & { record: TitanDkimRecord };

const hasRecord = ( entry: TitanDkimStatus ): entry is DkimMissingEntry => !! entry.record;

/**
 * Returns the domains whose DKIM record is missing, and polls the status while any of them
 * is being checked again. A domain being checked stays listed until its check ends, so its
 * notice can react to the new result.
 */
export function useDkimRecordChecks( enabled: boolean ) {
	const [ checkingDomains, setCheckingDomains ] = useState< string[] >( [] );
	const { data } = useQuery( {
		...titanDkimStatusQuery(),
		enabled,
		// The route loader already fetched it.
		refetchOnMount: false,
		refetchInterval: checkingDomains.length ? DKIM_POLL_INTERVAL : false,
	} );

	const onCheckStart = useCallback( ( domain: string ) => {
		setCheckingDomains( ( domains ) => [ ...domains, domain ] );
	}, [] );

	const onCheckEnd = useCallback( ( domain: string ) => {
		setCheckingDomains( ( domains ) => domains.filter( ( d ) => d !== domain ) );
	}, [] );

	const entries =
		enabled && Array.isArray( data )
			? data
					.filter( hasRecord )
					.filter(
						( entry ) => entry.status === 'missing' || checkingDomains.includes( entry.domain )
					)
			: [];

	return { entries, checkingDomains, onCheckStart, onCheckEnd };
}
