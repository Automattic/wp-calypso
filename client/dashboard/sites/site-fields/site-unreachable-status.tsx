import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { Site } from '@automattic/api-core';

// Only Jetpack-connected sites (including Atomic) can be unreachable — Simple sites aren't proxied.
export function useIsSiteUnreachable( site: Site, isInView: boolean ): boolean {
	const isEligible = site.jetpack && ! site.is_deleted;

	const { data } = useQuery( {
		...siteByIdQuery( site.ID ),
		enabled: isEligible && isInView,
	} );

	return !! data?.__inaccessible_jetpack_error;
}
