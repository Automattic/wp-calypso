import SummaryButton from '@automattic/components/src/summary-button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Card, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import { getDataCenterOptions } from 'calypso/data/data-center';
import { siteQuery, sitePrimaryDataCenterQuery } from '../../app/queries';
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import { canViewPrimaryDataCenterSettings } from '../features';
import SettingsPageHeader from '../settings-page-header';

export default function PrimaryDataCenterSettings( { siteSlug }: { siteSlug: string } ) {
	const router = useRouter();
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: primaryDataCenter } = useQuery( {
		...sitePrimaryDataCenterQuery( siteSlug ),
		enabled: site && canViewPrimaryDataCenterSettings( site ),
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
