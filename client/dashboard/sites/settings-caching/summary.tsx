import { HostingFeatures } from '@automattic/api-core';
import { siteEdgeCacheStatusQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { next } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasHostingFeature } from '../../utils/site-features';
import { isEdgeCacheAvailable } from './utils';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function CachingSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const canView = hasHostingFeature( site, HostingFeatures.CACHING );

	const { data: isEdgeCacheActive } = useQuery( {
		...siteEdgeCacheStatusQuery( site.ID ),
		enabled: canView,
	} );

	const getBadge = () => {
		if ( ! canView ) {
			return [];
		}

		if ( isEdgeCacheAvailable( site ) && isEdgeCacheActive ) {
			return [
				{
					text: __( 'Edge cache enabled' ),
					intent: 'success' as const,
				},
			];
		}

		return [
			{
				text: __( 'Edge cache disabled' ),
			},
		];
	};

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/caching` }
			title={ __( 'Caching' ) }
			density={ density }
			decoration={ <Icon icon={ next } /> }
			badges={ getBadge() }
		/>
	);
}
