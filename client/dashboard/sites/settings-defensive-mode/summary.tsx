import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { siteDefensiveModeQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUpdateDefensiveMode } from '../../utils/site-features';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export function useCanRenderSettingsDefensiveModeSummary( { site }: { site: Site } ) {
	const canUpdate = canUpdateDefensiveMode( site );

	const { data: siteDefensiveModeData } = useQuery( {
		...siteDefensiveModeQuery( site.slug ),
		enabled: canUpdate,
	} );

	return {
		show: !! canUpdate,
		props: {
			site,
			siteDefensiveModeData,
		},
	};
}

export default function DefensiveModeSettingsSummary( {
	site,
	siteDefensiveModeData,
	density,
}: ReturnType< typeof useCanRenderSettingsDefensiveModeSummary >[ 'props' ] & {
	density?: Density;
} ) {
	let badge;
	if ( siteDefensiveModeData ) {
		if ( siteDefensiveModeData.enabled ) {
			badge = {
				text: __( 'Enabled' ),
				intent: 'info' as const,
			};
		} else {
			badge = {
				text: __( 'Disabled' ),
			};
		}
	} else {
		badge = { text: __( 'Managed' ) };
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/defensive-mode` }
			title={ __( 'Defensive mode' ) }
			density={ density }
			decoration={ <Icon icon={ shield } /> }
			badges={ [ badge ] }
		/>
	);
}
