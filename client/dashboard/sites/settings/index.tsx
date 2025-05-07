import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteSettingsQuery } from '../../app/queries';
import { siteRoute } from '../../app/router';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { getSubscriptionGiftingSettingBadges } from '../settings-subscription-gifting';

export default function SiteSettings() {
	const { siteSlug } = siteRoute.useParams();
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );

	if ( ! settings ) {
		return null;
	}

	return (
		<PageLayout title={ __( 'Settings' ) } size="small">
			<Heading>{ __( 'General' ) }</Heading>
			<Card>
				<VStack>
					<RouterLinkSummaryButton
						to={ `/sites/${ siteSlug }/settings/subscription-gifting` }
						title={ __( 'Accept a gift subscription' ) }
						density="medium"
						badges={ getSubscriptionGiftingSettingBadges( settings ) }
					/>
				</VStack>
			</Card>
		</PageLayout>
	);
}
