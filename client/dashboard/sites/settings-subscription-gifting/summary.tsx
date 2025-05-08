import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasSubscriptionGiftingFeature } from './utils';
import type { SiteSettings, SiteFeatures } from '../../data/types';

export default function SubscriptionGiftingSettingsSummary( {
	siteSlug,
	features,
	settings,
}: {
	siteSlug: string;
	features: SiteFeatures;
	settings: SiteSettings;
} ) {
	if ( ! hasSubscriptionGiftingFeature( features ) ) {
		return null;
	}
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ siteSlug }/settings/subscription-gifting` }
			title={ __( 'Accept a gift subscription' ) }
			density="medium"
			badges={
				settings.wpcom_gifting_subscription
					? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
					: [ { text: __( 'Disabled' ) } ]
			}
		/>
	);
}
