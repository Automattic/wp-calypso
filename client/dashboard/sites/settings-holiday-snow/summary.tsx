import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { snow } from './icons';
import { isHolidaySnowAvailable } from './utils';
import type { Site, SiteSettings } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SettingsHolidaySnowSummary( {
	site,
	settings,
	density,
}: {
	site: Site;
	settings?: SiteSettings;
	density?: Density;
} ) {
	let badges;
	if ( settings ) {
		badges = settings.jetpack_holiday_snow_enabled
			? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
			: [ { text: __( 'Disabled' ) } ];
	}

	if ( ! isHolidaySnowAvailable( site ) ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/holiday-snow` }
			title={ __( 'Holiday snow' ) }
			density={ density }
			decoration={ <Icon icon={ snow } /> }
			badges={ badges }
		/>
	);
}
