import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteQuery, siteSettingsQuery } from '../../app/queries';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SubscriptionGiftingSettingsSummary from '../settings-subscription-gifting/summary';

export default function SiteSettings() {
	const { siteSlug } = siteRoute.useParams();
	const { data: siteData } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );

	if ( ! siteData || ! settings ) {
		return null;
	}

	return (
		<PageLayout size="small">
			<PageHeader title={ __( 'Settings' ) } />
			<Heading>{ __( 'General' ) }</Heading>
			<Card>
				<VStack>
					<SubscriptionGiftingSettingsSummary
						siteSlug={ siteSlug }
						site={ siteData.site }
						settings={ settings }
					/>
				</VStack>
			</Card>
		</PageLayout>
	);
}
