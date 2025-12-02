import { DotcomFeatures } from '@automattic/api-core';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { heading } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasPlanFeature } from '../../utils/site-features';
import type { Site, SiteSettings } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SubscriptionGiftingSettingsSummary( {
	site,
	settings,
	density,
}: {
	site: Site;
	settings?: SiteSettings;
	density?: Density;
} ) {
	if ( ! hasPlanFeature( site, DotcomFeatures.SUBSCRIPTION_GIFTING ) ) {
		return null;
	}

	let badges;
	if ( settings ) {
		badges = settings.wpcom_gifting_subscription
			? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
			: [ { text: __( 'Disabled' ) } ];
	}
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/subscription-gifting` }
			title={ __( 'Accept a gift subscription' ) }
			density={ density }
			decoration={ <Icon icon={ heading } /> }
			badges={ badges }
		/>
	);
}
