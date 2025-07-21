import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { siteDefensiveModeSettingsQuery } from '../../app/queries/site-defensive-mode';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { HostingFeatures } from '../../data/constants';
import { hasHostingFeature } from '../../utils/site-features';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function DefensiveModeSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const canView = hasHostingFeature( site, HostingFeatures.DEFENSIVE_MODE );

	const { data } = useQuery( {
		...siteDefensiveModeSettingsQuery( site.ID ),
		enabled: canView,
	} );

	const getBadge = () => {
		if ( ! data ) {
			return [];
		}

		if ( data.enabled ) {
			return [
				{
					text: __( 'Enabled' ),
					intent: 'info' as const,
				},
			];
		}

		return [
			{
				text: __( 'Disabled' ),
			},
		];
	};

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/defensive-mode` }
			title={ __( 'Defensive mode' ) }
			density={ density }
			decoration={ <Icon icon={ shield } /> }
			badges={ getBadge() }
		/>
	);
}
