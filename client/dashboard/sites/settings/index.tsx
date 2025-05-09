import { useLoaderData } from '@tanstack/react-router';
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteRoute, siteSettingsRoute } from '../../app/router';
import PageLayout from '../../components/page-layout';
import SubscriptionGiftingSettingsSummary from '../settings-subscription-gifting/summary';

export default function SiteSettings() {
	const { siteSlug } = siteRoute.useParams();
	const { site } = useLoaderData( { from: siteRoute.id } );
	const settings = useLoaderData( { from: siteSettingsRoute.id } );

	return (
		<PageLayout title={ __( 'Settings' ) } size="small">
			<Heading>{ __( 'General' ) }</Heading>
			<Card>
				<VStack>
					<SubscriptionGiftingSettingsSummary
						siteSlug={ siteSlug }
						site={ site }
						settings={ settings }
					/>
				</VStack>
			</Card>
		</PageLayout>
	);
}
