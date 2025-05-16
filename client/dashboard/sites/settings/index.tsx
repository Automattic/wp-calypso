import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteQuery, siteSettingsQuery } from '../../app/queries';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SiteVisibilitySettingsSummary from '../settings-site-visibility/summary';
import SubscriptionGiftingSettingsSummary from '../settings-subscription-gifting/summary';
import SiteActions from './site-actions';

export default function SiteSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: siteData } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );

	if ( ! siteData || ! settings ) {
		return null;
	}

	const { site } = siteData;

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Settings' ) } /> }>
			<Heading>{ __( 'General' ) }</Heading>
			<Card>
				<VStack>
					<SiteVisibilitySettingsSummary site={ site } />
					<SubscriptionGiftingSettingsSummary
						siteSlug={ siteSlug }
						site={ site }
						settings={ settings }
					/>
				</VStack>
			</Card>
			<SiteActions site={ site } />
		</PageLayout>
	);
}
