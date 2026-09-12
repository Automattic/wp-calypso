import { namePulseAvailabilityQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import {
	NAME_PULSE_AVAILABILITY_BATCH_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
	type NamePulseDomainUpdate,
} from '../../helpers/name-pulse';
import type { NamePulseAvailabilityEntry } from '@automattic/api-core';

/**
 * Map one bulk availability entry onto a row update. Unavailable entries carry
 * no pricing, so only `status` changes for them.
 */
export const toAvailabilityUpdate = (
	domainName: string,
	entry: NamePulseAvailabilityEntry
): NamePulseDomainUpdate => {
	if ( ! entry.is_available ) {
		return {
			domain_name: domainName,
			status: NamePulseDomainStatus.TAKEN,
		};
	}

	return {
		domain_name: domainName,
		status: NamePulseDomainStatus.AVAILABLE,
		cost: entry.cost,
		raw_price: entry.raw_price,
		sale_cost: entry.sale_cost,
		currency_code: entry.currency_code,
		is_premium: !! entry.is_premium,
		product_id: entry.product_id,
		product_slug: entry.product_slug,
		supports_privacy: entry.supports_privacy,
	};
};

/**
 * Progressive bulk availability: splits the requested names into batches of 36,
 * fires them in parallel through react-query (so a repeated batch within the
 * stale window is served from cache) and reports each resolved domain through
 * `onUpdate`.
 *
 * A batch that fails (network error, 429, timeout) or takes longer than
 * `NAME_PULSE_SKELETON_TIMEOUT_MS` reports its rows as UNKNOWN so they stop
 * showing a skeleton. UNKNOWN rows stay in the grid ("Couldn't check") and are
 * re-requested on the next search or "Show more"; a late response still lands
 * because `mergeResultUpdate` lets a verdict replace UNKNOWN.
 */
export const useNamePulseAvailability = ( onUpdate: ( update: NamePulseDomainUpdate ) => void ) => {
	const queryClient = useQueryClient();
	const onUpdateRef = useRef( onUpdate );
	const timersRef = useRef( new Set< ReturnType< typeof setTimeout > >() );
	// Names with a request in flight. Callers may ask for the same rows again
	// while they are still WAITING (Top results backfilling, a re-render of the
	// grid); those must not fan out into extra requests.
	const pendingRef = useRef( new Set< string >() );

	useEffect( () => {
		onUpdateRef.current = onUpdate;
	}, [ onUpdate ] );

	useEffect( () => {
		const timers = timersRef.current;

		return () => {
			timers.forEach( clearTimeout );
			timers.clear();
		};
	}, [] );

	const checkDomains = useCallback(
		( domainNames: string[] ) => {
			const pending = pendingRef.current;
			const unique = Array.from( new Set( domainNames ) ).filter(
				( name ) => ! pending.has( name )
			);

			for ( let i = 0; i < unique.length; i += NAME_PULSE_AVAILABILITY_BATCH_SIZE ) {
				const batch = unique.slice( i, i + NAME_PULSE_AVAILABILITY_BATCH_SIZE );
				batch.forEach( ( name ) => pending.add( name ) );

				const release = () => batch.forEach( ( name ) => pending.delete( name ) );

				const markUnknown = () => {
					for ( const domainName of batch ) {
						onUpdateRef.current( {
							domain_name: domainName,
							status: NamePulseDomainStatus.UNKNOWN,
						} );
					}
				};

				const timer = setTimeout( () => {
					timersRef.current.delete( timer );
					release();
					markUnknown();
				}, NAME_PULSE_SKELETON_TIMEOUT_MS );
				timersRef.current.add( timer );

				const settle = () => {
					clearTimeout( timer );
					timersRef.current.delete( timer );
					release();
				};

				queryClient
					.fetchQuery( namePulseAvailabilityQuery( batch ) )
					.then( ( data ) => {
						settle();

						for ( const domainName of batch ) {
							const entry = data[ domainName ];

							if ( ! entry || typeof entry.is_available !== 'boolean' ) {
								continue;
							}

							onUpdateRef.current( toAvailabilityUpdate( domainName, entry ) );
						}
					} )
					.catch( () => {
						settle();
						markUnknown();
					} );
			}
		},
		[ queryClient ]
	);

	return { checkDomains };
};
