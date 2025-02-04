import { SiteDetails } from '@automattic/data-stores';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import BaseSiteSelector from 'calypso/components/site-selector';

interface AtomicSitesSelectorProps {
	managedSites: [] | null;
	onSiteSelect?: ( blogId: number ) => void;
	isPlaceholder?: boolean;
}

const AtomicSitesSelector = ( {
	onSiteSelect,
	isPlaceholder,
	managedSites,
}: AtomicSitesSelectorProps ) => {
	const atomicSitesFilter = ( site: SiteDetails ) => site?.is_wpcom_atomic;
	const notManagedSitesFilter = ( site: SiteDetails ) => {
		return (
			atomicSitesFilter( site ) &&
			! managedSites?.find( ( managedSite: any ) => managedSite.blog_id === site.ID )
		);
	};

	return (
		<div className="atomic-sites-selector">
			<BaseSiteSelector
				clasName="add-sites-from-wpcom_site-selector"
				indicator
				allSitesPath={ A4A_SITES_LINK }
				sitesBasePath={ A4A_SITES_LINK }
				onSiteSelect={ onSiteSelect }
				filter={ notManagedSitesFilter }
				showHiddenSites={ false }
				showListBottomAdornment={ false }
				isPlaceholder={ isPlaceholder }
			/>
		</div>
	);
};

export default AtomicSitesSelector;
