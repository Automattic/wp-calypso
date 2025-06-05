import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { siteDefensiveModeQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUpdateDefensiveMode } from '../../utils/site-features';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function DefensiveModeSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const canUpdate = canUpdateDefensiveMode( site );

	const { data } = useQuery( {
		...siteDefensiveModeQuery( site.slug ),
		enabled: canUpdate,
	} );

	if ( ! canUpdate ) {
		return null;
	}

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
