import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import titles from 'calypso/me/purchases/titles';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DashboardBackportSitePurchases from './index';

export type PurchasesSection = 'activeUpgrades' | 'billingHistory' | 'paymentMethods';

/**
 * Site-level purchase management, rendered with the Dashboard's own billing
 * screens inside the classic site chrome. The Dashboard screens bring their own
 * page header and breadcrumbs, so the only classic chrome left here is the
 * section tab bar that moves between the three top-level pages.
 */
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
			<DocumentHead title={ titles.sectionTitle } />
			{ section && <PurchasesNavigation section={ section } siteSlug={ siteSlug } /> }
			<DashboardBackportSitePurchases path={ path } section={ section } siteId={ siteId } />
		</Main>
	);
}
