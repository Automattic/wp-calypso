import { getDataCenterOptions, HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery, sitePrimaryDataCenterQuery } from '@automattic/api-queries';
import SummaryButton from '@automattic/components/src/summary-button';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Card, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import SettingsPageHeader from '../settings-page-header';
import type { DataCenterOption } from '@automattic/api-core';

export default function PrimaryDataCenterSettings( { siteSlug }: { siteSlug: string } ) {
	const router = useRouter();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: primaryDataCenter } = useQuery( {
		...sitePrimaryDataCenterQuery( site.ID ),
		enabled: hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER ),
	} );

	const dataCenterOptions = getDataCenterOptions();
	const primaryDataCenterName = primaryDataCenter
		? dataCenterOptions[ primaryDataCenter as DataCenterOption ]
		: null;

	if ( ! primaryDataCenterName ) {
		router.navigate( { to: `/sites/${ siteSlug }/settings` } );
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
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
							badges={ [ { text: primaryDataCenterName } ] }
						/>
					</VStack>
				</Card>
			</VStack>
		</PageLayout>
	);
}
