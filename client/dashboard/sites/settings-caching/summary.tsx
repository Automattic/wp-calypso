import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { next } from '@wordpress/icons';
import { siteEdgeCacheStatusQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUpdateCaching, isEdgeCacheAvailable } from '../../utils/site-features';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function CachingSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const canUpdate = site && canUpdateCaching( site );

	const { data: isEdgeCacheActive } = useQuery( {
		...siteEdgeCacheStatusQuery( site.slug ),
		enabled: canUpdate,
	} );

	const getBadge = () => {
		if ( ! canUpdate ) {
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
