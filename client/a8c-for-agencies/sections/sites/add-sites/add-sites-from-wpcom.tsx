import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderTitle,
	LayoutHeaderActions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import useImportWPCOMSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-import-wpcom-site';
import useFetchDashboardSites, {
	FetchDashboardSitesArgsInterface,
} from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import AtomicSitesSelector from './atomic-sites-selector';
import './styles.scss';

interface AddSitesFromWPCOMProps {
	dashboardSitesQuery: FetchDashboardSitesArgsInterface;
}

const AddSitesFromWPCOM = ( { dashboardSitesQuery }: AddSitesFromWPCOMProps ) => {
	const translate = useTranslate();

	const { data, isFetched, isLoading } = useFetchDashboardSites( dashboardSitesQuery );
	const { mutate: importWPCOMSite, isPending: isImportingSite } = useImportWPCOMSiteMutation();
	const { refetch: refetchPendingSites } = useFetchPendingSites();

	const handleSiteSelection = useCallback(
		( blogId: number ) => {
			importWPCOMSite(
				{ blog_id: blogId },
				{
					onSuccess: () => {
						refetchPendingSites();
						page( addQueryArgs( A4A_SITES_LINK, { created_site: blogId } ) );
					},
				}
			);
		},
		[ importWPCOMSite ]
	);

	return (
		<LayoutColumn className="add-sites-from-wpcom add-sites-from-wpcom__layout" wide>
			<LayoutTop>
				<LayoutHeader>
					<LayoutHeaderTitle>{ translate( 'Add sites from WordPress.com' ) }</LayoutHeaderTitle>
					<LayoutHeaderActions>
						<MobileSidebarNavigation />
					</LayoutHeaderActions>
				</LayoutHeader>
			</LayoutTop>

			<div className="add-sites-from-wpcom__body">
				<AtomicSitesSelector
					onSiteSelect={ handleSiteSelection }
					isPlaceholder={ isImportingSite || isLoading || ! isFetched }
					managedSites={ data?.sites }
				/>
			</div>
		</LayoutColumn>
	);
};

export default AddSitesFromWPCOM;
