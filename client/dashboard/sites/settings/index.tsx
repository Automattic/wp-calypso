import { __experimentalSummaryButtonList as SummaryButtonList } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteSettingsQuery } from '../../app/queries';
import { siteRoute } from '../../app/router';
import PageLayout from '../../components/page-layout';
import SubscriptionGiftingSettingsSummary from '../settings-subscription-gifting/summary';

export default function SiteSettings() {
	const { siteSlug } = siteRoute.useParams();
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );

	if ( ! settings ) {
		return null;
	}

	return (
		<PageLayout title={ __( 'Settings' ) } size="small">
			<SummaryButtonList title={ __( 'General' ) }>
				<SubscriptionGiftingSettingsSummary siteSlug={ siteSlug } settings={ settings } />
			</SummaryButtonList>
		</PageLayout>
	);
}
