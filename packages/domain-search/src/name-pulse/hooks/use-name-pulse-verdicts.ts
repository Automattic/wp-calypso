import { useQueries, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEvent } from '@wordpress/compose';
import { useCallback, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import {
	mergeNamePulseVerdict,
	NAME_PULSE_AVAILABILITY_BATCH_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NAME_PULSE_VERDICT_TTL_MS,
	NamePulseDomainStatus,
	pickPricing,
	type NamePulseVerdict,
	type NamePulseVerdictState,
} from '../helpers';
import type {
	NamePulseAvailabilityEntry,
	NamePulseAvailabilityResponse,
} from '@automattic/api-core';

export const namePulseVerdictQueryKey = ( domainName: string ) =>
	[ 'name-pulse-domain', domainName ] as const;

/**
 * Real-time checks write here; the bulk batches land through the query itself.
 */
export const setNamePulseVerdict = (
	queryClient: QueryClient,
	domainName: string,
	verdict: NamePulseVerdict
) =>
	queryClient.setQueryData< NamePulseVerdict >(
		namePulseVerdictQueryKey( domainName ),
		( existing ) => mergeNamePulseVerdict( existing, verdict )
	);

/**
 * Unavailable entries carry no pricing. A missing or malformed entry has no
 * verdict, so the name reports UNKNOWN.
 */
const toVerdict = (
	entry: NamePulseAvailabilityEntry | undefined
): NamePulseVerdict | undefined => {
	if ( ! entry || typeof entry.is_available !== 'boolean' ) {
		return undefined;
	}

	if ( ! entry.is_available ) {
		return { status: NamePulseDomainStatus.TAKEN };
	}

	return { status: NamePulseDomainStatus.AVAILABLE, ...pickPricing( entry ) };
};

interface Waiter {
	resolve: ( verdict: NamePulseVerdict ) => void;
	reject: ( error: Error ) => void;
}

/**
 * Collects the names react-query asks for in one tick and checks them in
 * parallel batches. A batch that outlives `NAME_PULSE_SKELETON_TIMEOUT_MS`
 * rejects its names (they read as UNKNOWN); a late response still lands in
 * the cache through `onLateVerdict`.
 */
class NamePulseAvailabilityBatcher {
	private queue = new Map< string, Waiter >();
	private isFlushScheduled = false;

	constructor(
		private fetchBatch: ( domainNames: string[] ) => Promise< NamePulseAvailabilityResponse >,
		private onLateVerdict: ( domainName: string, verdict: NamePulseVerdict ) => void
	) {}

	load( domainName: string ) {
		return new Promise< NamePulseVerdict >( ( resolve, reject ) => {
			this.queue.set( domainName, { resolve, reject } );

			if ( ! this.isFlushScheduled ) {
				this.isFlushScheduled = true;
				Promise.resolve().then( () => this.flush() );
			}
		} );
	}

	private flush() {
		this.isFlushScheduled = false;
		const waiters = this.queue;
		this.queue = new Map();
		const names = Array.from( waiters.keys() );

		for ( let i = 0; i < names.length; i += NAME_PULSE_AVAILABILITY_BATCH_SIZE ) {
			this.send( names.slice( i, i + NAME_PULSE_AVAILABILITY_BATCH_SIZE ), waiters );
		}
	}

	private send( batch: string[], waiters: Map< string, Waiter > ) {
		let hasTimedOut = false;
		const timer = setTimeout( () => {
			hasTimedOut = true;
			batch.forEach( ( name ) =>
				waiters.get( name )?.reject( new Error( 'Availability check timed out.' ) )
			);
		}, NAME_PULSE_SKELETON_TIMEOUT_MS );

		this.fetchBatch( batch ).then(
			( data ) => {
				clearTimeout( timer );

				for ( const name of batch ) {
					const verdict = toVerdict( data[ name ] );

					if ( hasTimedOut ) {
						if ( verdict ) {
							this.onLateVerdict( name, verdict );
						}
					} else if ( verdict ) {
						waiters.get( name )?.resolve( verdict );
					} else {
						waiters.get( name )?.reject( new Error( `No availability entry for ${ name }.` ) );
					}
				}
			},
			( error: Error ) => {
				clearTimeout( timer );

				if ( ! hasTimedOut ) {
					batch.forEach( ( name ) => waiters.get( name )?.reject( error ) );
				}
			}
		);
	}
}

/**
 * One query per domain name, keyed by the name alone, so a verdict is shared
 * by every row and every search that lists the name and survives the name
 * leaving the grid for `NAME_PULSE_VERDICT_TTL_MS`. Pending is WAITING and
 * error is UNKNOWN, so neither is ever cached; a cache hit renders on the
 * same render the name appears. Names are fetched only while `enabled`.
 */
export const useNamePulseVerdicts = (
	domainNames: string[],
	enabled: boolean
): Record< string, NamePulseVerdictState > => {
	const queryClient = useQueryClient();
	const { queries } = useDomainSearch();
	const fetchBatch = useEvent( ( batch: string[] ) =>
		queryClient.fetchQuery( queries.namePulseAvailability( batch ) )
	);
	const onLateVerdict = useEvent( ( domainName: string, verdict: NamePulseVerdict ) =>
		setNamePulseVerdict( queryClient, domainName, verdict )
	);
	const [ batcher ] = useState(
		() => new NamePulseAvailabilityBatcher( fetchBatch, onLateVerdict )
	);

	// `combine` output is structurally shared, so the states only change when a
	// verdict does. It must close over the names: react-query memoises it on the
	// observers' results, which lag one render behind a key change.
	const combine = useCallback(
		( results: { data: NamePulseVerdict | undefined; isError: boolean }[] ) =>
			Object.fromEntries(
				results.map( ( { data, isError }, index ): [ string, NamePulseVerdictState ] => [
					domainNames[ index ],
					{ verdict: data, isUnknown: isError },
				] )
			),
		[ domainNames ]
	);

	return useQueries( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps -- the batcher and client are stable; the name is the key
		queries: domainNames.map( ( domainName ) => ( {
			queryKey: namePulseVerdictQueryKey( domainName ),
			queryFn: () =>
				batcher
					.load( domainName )
					.then( ( verdict ) =>
						mergeNamePulseVerdict(
							queryClient.getQueryData< NamePulseVerdict >(
								namePulseVerdictQueryKey( domainName )
							),
							verdict
						)
					),
			enabled,
			staleTime: NAME_PULSE_VERDICT_TTL_MS,
			gcTime: NAME_PULSE_VERDICT_TTL_MS,
			retry: false,
			meta: { persist: false },
		} ) ),
		combine,
	} );
};
