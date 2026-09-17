import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useDomainSearch } from '../../page/context';
import {
	NAME_PULSE_AVAILABILITY_BATCH_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
	type NamePulseDomainUpdate,
} from '../helpers';
import type { NamePulseAvailabilityEntry } from '@automattic/api-core';

/**
 * Unavailable entries carry no pricing, so only `status` changes for them.
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
 * Batches go through react-query, so a repeated batch within the stale window is
 * served from cache. A batch that fails or outlives `NAME_PULSE_SKELETON_TIMEOUT_MS`
 * reports its rows as UNKNOWN; a late response still lands because
 * `mergeResultUpdate` lets a verdict replace UNKNOWN.
 */
export const useNamePulseAvailability = ( onUpdate: ( update: NamePulseDomainUpdate ) => void ) => {
	const queryClient = useQueryClient();
	const { queries } = useDomainSearch();
	const onUpdateRef = useRef( onUpdate );
	const queriesRef = useRef( queries );
	const timersRef = useRef( new Set< ReturnType< typeof setTimeout > >() );
	// Names with a request in flight; asking again for rows still WAITING must
	// not fan out into extra requests.
	const pendingRef = useRef( new Set< string >() );

	useEffect( () => {
		onUpdateRef.current = onUpdate;
		queriesRef.current = queries;
	}, [ onUpdate, queries ] );

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
					.fetchQuery( queriesRef.current.namePulseAvailability( batch ) )
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
