import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { institution } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUpdateHundredYearPlanFeatures } from '../../utils/site-features';
import type { Site, SiteSettings } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export function useCanRenderHundredYearPlanSettingsSummary( {
	site,
	settings,
}: {
	site: Site;
	settings: SiteSettings;
} ) {
	return {
		show: canUpdateHundredYearPlanFeatures( site ),
		props: { site, settings },
	};
}

export default function HundredYearPlanSummary( {
	site,
	settings,
	density,
}: ReturnType< typeof useCanRenderHundredYearPlanSettingsSummary >[ 'props' ] & {
	density?: Density;
} ) {
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/hundred-year-plan` }
			title={ __( 'Control your legacy' ) }
			density={ density }
			decoration={ <Icon icon={ institution } /> }
			badges={
				settings.wpcom_locked_mode ? [ { text: __( 'Site locked' ), intent: 'info' as const } ] : []
			}
		/>
	);
}
