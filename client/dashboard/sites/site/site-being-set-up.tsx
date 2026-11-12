import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { canManageSite } from '../features';

const SITE_POLL_INTERVAL = 3000;

/**
 * Shown in place of a site's pages while it turns Atomic. It checks the site again until its owner
 * can manage it, and the site's pages then replace it.
 */
export default function SiteBeingSetUp( { siteSlug }: { siteSlug: string } ) {
	useQuery( {
		...siteBySlugQuery( siteSlug ),
		refetchInterval: ( query ) =>
			query.state.data && canManageSite( query.state.data ) ? false : SITE_POLL_INTERVAL,
	} );

	return (
		<PageLayout header={ <PageHeader title={ siteSlug } /> }>
			<Card>
				<CardBody>
					<HStack spacing={ 3 } justify="flex-start" role="status">
						<Spinner />
						<Text>
							{ __(
								'We’re setting up your site. This usually takes a minute or two, and this page will refresh on its own when it’s ready.'
							) }
						</Text>
					</HStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
