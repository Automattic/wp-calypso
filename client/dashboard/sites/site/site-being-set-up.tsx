import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { canManageSite } from '../features';

const SITE_POLL_INTERVAL = 3000;

export default function SiteBeingSetUp( { siteSlug }: { siteSlug: string } ) {
	const router = useRouter();
	const { data: site } = useQuery( {
		...siteBySlugQuery( siteSlug ),
		refetchInterval: ( query ) =>
			query.state.data && canManageSite( query.state.data ) ? false : SITE_POLL_INTERVAL,
	} );
	const isReady = !! site && canManageSite( site );

	useEffect( () => {
		if ( isReady ) {
			router.invalidate();
		}
	}, [ isReady, router ] );

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
