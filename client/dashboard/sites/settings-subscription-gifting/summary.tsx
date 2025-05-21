import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { heading } from '@wordpress/icons';
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
			to={ `/sites/${ site.slug }/settings/subscription-gifting` }
			title={ __( 'Accept a gift subscription' ) }
			density="medium"
			decoration={ <Icon icon={ heading } /> }
			badges={
				settings.wpcom_gifting_subscription
					? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
					: [ { text: __( 'Disabled' ) } ]
			}
		/>
	);
}
