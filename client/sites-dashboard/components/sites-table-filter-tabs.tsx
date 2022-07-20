import { useSitesTableFiltering, TabPanel } from '@automattic/components';
import { removeQueryArgs, addQueryArgs } from '@wordpress/url';
import page from 'page';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesTableFilterTabsProps {
	allSites: SiteExcerptData[];
	children( filteredSites: SiteExcerptData[], filterOptions: SitesTableFilterOptions ): JSX.Element;
	className?: string;
	filterOptions: SitesTableFilterOptions;
}

interface SitesTableFilterOptions {
	status?: string;
	search?: string;
}

export function SitesTableFilterTabs( {
	allSites,
	children: renderContents,
	className,
	filterOptions,
}: SitesTableFilterTabsProps ) {
	const { filteredSites, tabs } = useSitesTableFiltering( allSites, filterOptions );

	const initialTabName = tabs.find( ( tab ) => tab.name === filterOptions.status )
		? filterOptions.status
		: undefined;

	return (
		<TabPanel
			className={ className }
			initialTabName={ initialTabName }
			tabs={ tabs }
			onSelect={ ( tabName ) => {
				page(
					'all' === tabName
						? removeQueryArgs( window.location.pathname + window.location.search, 'status' )
						: addQueryArgs( window.location.pathname + window.location.search, { status: tabName } )
				);
			} }
		>
			{ () => renderContents( filteredSites, filterOptions ) }
		</TabPanel>
	);
}
