import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { heading } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasSubscriptionGiftingFeature } from './utils';
import type { Site, SiteSettings } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SubscriptionGiftingSettingsSummary( {
	site,
	settings,
	density,
}: {
	site: Site;
	settings: SiteSettings;
	density?: Density;
} ) {
	if ( ! hasSubscriptionGiftingFeature( site ) ) {
		return null;
	}
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/subscription-gifting` }
			title={ __( 'Accept a gift subscription' ) }
			density={ density }
			decoration={ <Icon icon={ heading } /> }
			badges={
				settings.wpcom_gifting_subscription
					? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
					: [ { text: __( 'Disabled' ) } ]
			}
		/>
	);
}
