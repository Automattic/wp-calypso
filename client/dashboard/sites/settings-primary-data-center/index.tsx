import { getDataCenterOptions } from '@automattic/api-core';
import { siteBySlugQuery, sitePrimaryDataCenterQuery } from '@automattic/api-queries';
import SummaryButton from '@automattic/components/src/summary-button';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Card, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import Breadcrumbs from '../../app/breadcrumbs';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { DataCenterOption } from '@automattic/api-core';

export default function PrimaryDataCenterSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: primaryDataCenter } = useSuspenseQuery( sitePrimaryDataCenterQuery( site.ID ) );

	const dataCenterOptions = getDataCenterOptions();
	const badges = primaryDataCenter
		? [ { text: dataCenterOptions[ primaryDataCenter as DataCenterOption ] } ]
		: undefined;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Primary data center' ) }
					description={ __(
						'The primary data center is where your site is physically located. For redundancy, your site also replicates in real-time to a second data center in a different region.'
					) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				<Notice>
					{ __(
						'Your site has already been placed in the optimal data center. It’s not currently possible to change your primary data center.'
					) }
				</Notice>
				<Card>
					<VStack>
						<SummaryButton
							title={ __( 'Primary data center' ) }
							density="medium"
							decoration={ <Icon icon={ cloud } /> }
							showArrow={ false }
							disabled
							badges={ badges }
						/>
					</VStack>
				</Card>
			</VStack>
		</PageLayout>
	);
}
