import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useCreateWPCOMSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-create-wpcom-site';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import SitesHeaderActions from '../sites-header-actions';
import { AvailablePlans } from './plan-field';
import NeedSetupTable from './table';

export default function NeedSetup() {
	const translate = useTranslate();

	const title = translate( 'Sites' );

	const { data: pendingSites, isFetching, refetch: refetchPendingSites } = useFetchPendingSites();

	const { mutate: createWPCOMSite, isPending: isCreatingSite } = useCreateWPCOMSiteMutation();

	const availableSites =
		pendingSites?.filter(
			( { features }: { features: { wpcom_atomic: { state: string } } } ) =>
				features.wpcom_atomic.state === 'pending'
		) ?? [];

	const availablePlans: AvailablePlans[] = availableSites.length
		? [
				{
					name: translate( 'WordPress.com Creator' ),
					available: availableSites.length as number,
					ids: availableSites.map( ( { id }: { id: number } ) => id ),
				},
		  ]
		: [];

	const isProvisioning =
		isCreatingSite ||
		pendingSites?.find(
			( { features }: { features: { wpcom_atomic: { state: string } } } ) =>
				features.wpcom_atomic.state === 'provisioning'
		);

	const onCreateSite = useCallback(
		( id: number ) => {
			createWPCOMSite(
				{ id },
				{
					onSuccess: () => {
						// refetch pending sites
						refetchPendingSites();
					},
				}
			);
		},
		[ createWPCOMSite, refetchPendingSites ]
	);

	return (
		<Layout className="sites-dashboard sites-dashboard__layout preview-hidden" wide title={ title }>
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop>
					<LayoutHeader>
						<Title>{ translate( 'Sites' ) }</Title>
						<Actions>
							<MobileSidebarNavigation />
							<SitesHeaderActions />
						</Actions>
					</LayoutHeader>
				</LayoutTop>

				<NeedSetupTable
					availablePlans={ availablePlans }
					isLoading={ isFetching }
					provisioning={ isProvisioning }
					onCreateSite={ onCreateSite }
				/>
			</LayoutColumn>
		</Layout>
	);
}
