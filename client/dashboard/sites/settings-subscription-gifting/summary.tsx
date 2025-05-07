import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { SiteSettings } from '../../data/types';

interface SubscriptionGiftingSettingsSummaryProps {
	siteSlug: string;
	settings: SiteSettings;
}

export default function SubscriptionGiftingSettingsSummary( {
	siteSlug,
	settings: { wpcom_gifting_subscription },
}: SubscriptionGiftingSettingsSummaryProps ) {
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ siteSlug }/settings/subscription-gifting` }
			title={ __( 'Accept a gift subscription' ) }
			density="medium"
			badges={
				wpcom_gifting_subscription
					? [ { text: __( 'Enabled' ), intent: 'success' } ]
					: [ { text: __( 'Disabled' ) } ]
			}
		/>
	);
}
