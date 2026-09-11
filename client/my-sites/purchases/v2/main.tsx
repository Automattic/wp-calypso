import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import titles from 'calypso/me/purchases/titles';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DashboardBackportSitePurchases from './index';
import type { PurchasesSection } from './site-filter';

// The Dashboard screens bring their own page header and breadcrumbs, so the only
// classic chrome left here is the section tab bar.
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
