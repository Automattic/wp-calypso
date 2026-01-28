import { bigSkyPluginQuery } from '@automattic/api-queries';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function AISiteToolsSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { data: pluginStatus, isLoading } = useQuery( bigSkyPluginQuery( site.ID ) );
	const isEnabled = pluginStatus?.enabled ?? false;
	const isAvailable = pluginStatus?.available ?? false;

	const getBadge = () => {
		if ( isLoading || ! isAvailable ) {
			return [];
		}

		if ( isEnabled ) {
			return [
				{
					text: __( 'Enabled' ),
					intent: 'success' as const,
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
			to={ `/sites/${ site.slug }/settings/ai-tools` }
			title={ __( 'AI tools (early access)' ) }
			density={ density }
			decoration={ <BigSkyLogo.CentralLogo heartless size={ 24 } fill="#757575" /> }
			badges={ getBadge() }
		/>
	);
}
