import { HostingFeatures, type Site } from '@automattic/api-core';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasHostingFeature } from '../../utils/site-features';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function ApmSettingsSummary( { site, density }: { site: Site; density?: Density } ) {
	const canView = hasHostingFeature( site, HostingFeatures.APM );

	const getBadge = () => {
		if ( ! canView ) {
			return [];
		}

		if ( site.options?.apm_enabled ) {
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
			to={ `/sites/${ site.slug }/settings/apm` }
			title={ __( 'Application Performance Monitoring' ) }
			density={ density }
			decoration={ <Icon icon={ chartBar } /> }
			badges={ getBadge() }
		/>
	);
}
