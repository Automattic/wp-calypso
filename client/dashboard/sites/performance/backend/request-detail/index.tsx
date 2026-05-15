import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../../../app/breadcrumbs';
import { Card, CardHeader } from '../../../../components/card';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { siteApmRequestQuery } from '../mock-data';
import { formatMs } from '../utils';

export default function RequestDetail( {
	siteSlug,
	requestId,
}: {
	siteSlug: string;
	requestId: string;
} ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: request } = useSuspenseQuery( siteApmRequestQuery( site.ID, requestId ) );

	return (
		<PageLayout
			header={ <PageHeader prefix={ <Breadcrumbs length={ 3 } /> } title={ __( 'Request' ) } /> }
		>
			<Card>
				<CardHeader>
					<VStack spacing={ 1 } alignment="flex-start">
						<Text weight={ 600 }>
							{ request.method } { request.url }
						</Text>
						<HStack spacing={ 4 } justify="flex-start">
							<Text variant="muted">
								{ __( 'Status' ) }: { request.status }
							</Text>
							<Text variant="muted">
								{ __( 'Duration' ) }: { formatMs( request.duration_ms ) }
							</Text>
						</HStack>
					</VStack>
				</CardHeader>
			</Card>
		</PageLayout>
	);
}
