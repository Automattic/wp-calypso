import SummaryButton from '@automattic/components/src/summary-button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Card, Icon, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import { getDataCenterOptions } from 'calypso/data/data-center';
import { siteQuery, sitePrimaryDataCenterQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import type { Site } from '../../data/types';

export function canGetPrimaryDataCenter( site: Site ) {
	return site.is_wpcom_atomic;
}

export default function PrimaryDataCenterSettings( { siteSlug }: { siteSlug: string } ) {
	const router = useRouter();
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: primaryDataCenter } = useQuery( {
		...sitePrimaryDataCenterQuery( siteSlug ),
		enabled: site && canGetPrimaryDataCenter( site ),
	} );

	const dataCenterOptions = getDataCenterOptions();
	const primaryDataCenterName = primaryDataCenter ? dataCenterOptions[ primaryDataCenter ] : null;

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
				<Notice isDismissible={ false }>
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
