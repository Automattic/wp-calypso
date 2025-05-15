import { __ } from '@wordpress/i18n';
import { siteSettingsSubscriptionGiftingRoute } from '../../app/router';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasSubscriptionGiftingFeature } from './utils';
import type { Site, SiteSettings } from '../../data/types';

export default function SubscriptionGiftingSettingsSummary( {
	site,
	settings,
}: {
	site: Site;
	settings: SiteSettings;
} ) {
	if ( ! hasSubscriptionGiftingFeature( site ) ) {
		return null;
	}
	return (
		<RouterLinkSummaryButton
			to={ siteSettingsSubscriptionGiftingRoute.to }
			title={ siteSettingsSubscriptionGiftingRoute.options.staticData.label() }
			density="medium"
			badges={
				settings.wpcom_gifting_subscription
					? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
					: [ { text: __( 'Disabled' ) } ]
			}
		/>
	);
}
