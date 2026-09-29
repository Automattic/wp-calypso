import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import ComponentViewTracker from '../../components/component-view-tracker';
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

export function SiteUnreachableBadge( { site }: { site: Site } ) {
	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_sites_unreachable_status_impression"
				properties={ { is_atomic: !! site.is_wpcom_atomic } }
			/>
			<span title={ __( 'WordPress.com can’t reach this site right now.' ) }>
				<Badge intent="high">{ __( 'Unreachable' ) }</Badge>
			</span>
		</>
	);
}
