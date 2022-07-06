import { TabPanel } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import type { SiteData } from 'calypso/state/ui/selectors/site-data'; // eslint-disable-line no-restricted-imports

interface SitesTableFilterTabsProps {
	allSites: SiteData[];
	children( filteredSites: SiteData[] ): JSX.Element;
	className?: string;
}

export function SitesTableFilterTabs( {
	allSites,
	children: renderContents,
	className,
}: SitesTableFilterTabsProps ) {
	const { __ } = useI18n();

	return (
		<TabPanel
			className={ className }
			tabs={ [
				{ name: 'all', title: __( 'All' ) },
				{ name: 'launched', title: __( 'Launched' ) },
				{ name: 'private', title: __( 'Private' ) },
				{ name: 'coming-soon', title: __( 'Coming soon' ) },
			] }
		>
			{ ( tab ) => renderContents( filterSites( allSites, tab.name ) ) }
		</TabPanel>
	);
}

function filterSites( sites: SiteData[], filterType: string ): SiteData[] {
	return sites.filter( ( site ) => {
		const isComingSoon =
			site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );

		switch ( filterType ) {
			case 'launched':
				return ! site.is_private && ! isComingSoon;
			case 'private':
				return site.is_private && ! isComingSoon;
			case 'coming-soon':
				return isComingSoon;
			default:
				// Treat unknown filters the same as 'all'
				return site;
		}
	} );
}
