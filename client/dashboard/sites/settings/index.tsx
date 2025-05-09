import { useQuery } from '@tanstack/react-query';
import { Outlet, useMatch, useMatches } from '@tanstack/react-router';
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteQuery, siteSettingsQuery } from '../../app/queries';
import { siteSettingsRoute } from '../../app/router';
import PageLayout from '../../components/page-layout';
import SubscriptionGiftingSettingsSummary from '../settings-subscription-gifting/summary';

export default function SiteSettings() {
	const { siteSlug } = siteSettingsRoute.useParams();
	const { data: siteData } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );

	const matches = useMatches();
	const match = useMatch( { from: siteSettingsRoute.id } );

	if ( ! siteData || ! settings ) {
		return null;
	}

	const isExactMatch = match.id === matches[ matches.length - 1 ].id;
	if ( ! isExactMatch ) {
		return <Outlet />;
	}

	return (
		<PageLayout title={ __( 'Settings' ) } size="small">
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
