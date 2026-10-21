import { agencySiteQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, shield } from '@wordpress/icons';
import { agencySiteRoute } from '../../../app/router/agency';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { Text } from '../../../components/text';

export default function AgencySiteScan() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useSuspenseQuery( agencySiteQuery( siteSlug ) );

	if ( ! site?.has_scan ) {
		return (
			<PageLayout header={ <PageHeader title={ __( 'Scan' ) } /> }>
				<Card>
					<CardBody>
						<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
							<Icon icon={ shield } />
							<Text variant="muted">{ __( 'Scan isn’t enabled for this site.' ) }</Text>
						</HStack>
					</CardBody>
				</Card>
			</PageLayout>
		);
	}

	return <Outlet />;
}
