import { invalidateAgencyLicenses, agencyPendingSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import type { AgencyPendingSite } from '@automattic/api-core';

const POLL_INTERVAL_MS = 5000;

/**
 * A response that is not the expected list must not take the licenses page
 * down with it, since this polls.
 */
function toProvisioningKeys( data: unknown ): string[] {
	if ( ! Array.isArray( data ) ) {
		return [];
	}

	return ( data as AgencyPendingSite[] ).flatMap( ( { features } ) =>
		features?.wpcom_atomic?.state === 'provisioning' ? [ features.wpcom_atomic.license_key ] : []
	);
}

/**
 * The licenses whose site is being created right now. Polled while any of them
 * is, so a row stops reporting itself as provisioning once the site lands.
 */
export function useProvisioningLicenses( agencyId: number ): {
	provisioningLicenseKeys: Set< string >;
	isProvisioning: boolean;
} {
	const { data } = useQuery( {
		...agencyPendingSitesQuery( agencyId ),
		enabled: agencyId > 0,
		refetchInterval: ( { state } ) =>
			toProvisioningKeys( state.data ).length ? POLL_INTERVAL_MS : false,
	} );

	const keys = useMemo( () => toProvisioningKeys( data ), [ data ] );
	const previousKeys = useRef< string[] >( [] );

	// A license that finishes provisioning gets a site URL, which lives on the
	// license list rather than here — without this the row would fall back to
	// reporting no site at all until something else refetched it.
	useEffect( () => {
		const hasFinished = previousKeys.current.some( ( key ) => ! keys.includes( key ) );
		previousKeys.current = keys;

		if ( hasFinished ) {
			invalidateAgencyLicenses( agencyId );
		}
	}, [ keys, agencyId ] );

	return {
		provisioningLicenseKeys: useMemo( () => new Set( keys ), [ keys ] ),
		isProvisioning: keys.length > 0,
	};
}
