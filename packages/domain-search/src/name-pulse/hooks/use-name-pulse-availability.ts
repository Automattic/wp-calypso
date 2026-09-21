import { useQueryClient } from '@tanstack/react-query';
import { useEvent } from '@wordpress/compose';
import { useCallback, useEffect, useRef } from 'react';
import { useDomainSearch } from '../../page/context';
import {
	NAME_PULSE_AVAILABILITY_BATCH_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
	pickPricing,
	type NamePulseDomainUpdate,
} from '../helpers';
import type { NamePulseAvailabilityEntry } from '@automattic/api-core';

/**
 * Unavailable entries carry no pricing, so only `status` changes for them.
 */
const toAvailabilityUpdate = (
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
		...pickPricing( entry ),
	};
};

/**
 * Batches go through react-query, so a repeated batch within the stale window is
 * served from cache. A batch that fails or outlives `NAME_PULSE_SKELETON_TIMEOUT_MS`
 * reports its rows as UNKNOWN, and so is a name the response leaves out; a late
 * response still lands because `mergeResultUpdate` lets a verdict replace UNKNOWN.
 */
export const useNamePulseAvailability = ( onUpdate: ( update: NamePulseDomainUpdate ) => void ) => {
	const queryClient = useQueryClient();
	const { queries } = useDomainSearch();
	const emitUpdate = useEvent( onUpdate );
	const availabilityQuery = useEvent( ( batch: string[] ) =>
		queries.namePulseAvailability( batch )
	);
	const timersRef = useRef( new Set< ReturnType< typeof setTimeout > >() );
	// Names with a request in flight; asking again for rows still WAITING must
	// not fan out into extra requests.
	const pendingRef = useRef( new Set< string >() );

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

				const markUnknown = () =>
					batch.forEach( ( domain_name ) =>
						emitUpdate( { domain_name, status: NamePulseDomainStatus.UNKNOWN } )
					);

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
					.fetchQuery( availabilityQuery( batch ) )
					.then( ( data ) => {
						settle();

						for ( const domainName of batch ) {
							const entry = data[ domainName ];

							if ( ! entry || typeof entry.is_available !== 'boolean' ) {
								emitUpdate( { domain_name: domainName, status: NamePulseDomainStatus.UNKNOWN } );
								continue;
							}

							emitUpdate( toAvailabilityUpdate( domainName, entry ) );
						}
					} )
					.catch( () => {
						settle();
						markUnknown();
					} );
			}
		},
		[ queryClient, emitUpdate, availabilityQuery ]
	);

	return { checkDomains };
};
