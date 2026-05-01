import { BusinessPlans, EcommercePlans, type Site } from '@automattic/api-core';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

function hasApmAccess( productSlug: string | undefined ) {
	if ( ! productSlug ) {
		return false;
	}
	return (
		( BusinessPlans as readonly string[] ).includes( productSlug ) ||
		( EcommercePlans as readonly string[] ).includes( productSlug )
	);
}

export default function ApmSettingsSummary( { site, density }: { site: Site; density?: Density } ) {
	const canView = hasApmAccess( site.plan?.product_slug );

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
