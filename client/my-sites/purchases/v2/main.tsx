import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import titles from 'calypso/me/purchases/titles';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DashboardBackportSitePurchases from './index';
import type { PurchasesSection } from './site-filter';

// The Dashboard screens bring their own page header and breadcrumbs. The only
// classic chrome left is the section tab bar, and it is rendered inside the
// Dashboard layout so it sits below the page title rather than above it.
export default function SitePurchasesBackport( {
	path,
	section,
	siteSlug,
}: {
	path: string;
	section?: PurchasesSection;
	siteSlug: string;
} ) {
	const siteId = useSelector( getSelectedSiteId );

	return (
		<Main wideLayout className="purchases">
			{ isJetpackCloud() && <SidebarNavigation /> }
			<DocumentHead title={ titles.sectionTitle } />
			<DashboardBackportSitePurchases
				path={ path }
				section={ section }
				siteId={ siteId }
				siteSlug={ siteSlug }
			/>
		</Main>
	);
}
