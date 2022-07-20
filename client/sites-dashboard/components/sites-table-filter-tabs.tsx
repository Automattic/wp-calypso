import { useSitesTableFiltering } from '@automattic/components';
import styled from '@emotion/styled';
import { TabPanel } from '@wordpress/components';
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

const SitesTabPanel = styled( TabPanel )`
	.components-tab-panel__tabs {
		overflow-x: auto;
	}

	.components-tab-panel__tabs-item {
		--wp-admin-theme-color: var( --studio-gray-100 );
		color: var( --studio-gray-60 );
		padding: 0;
		margin-right: 24px;
		font-size: 16px;
		flex-shrink: 0;
	}
	.components-tab-panel__tabs-item:hover,
	.components-tab-panel__tabs-item.is-active,
	.components-tab-panel__tabs-item.is-active:focus,
	.components-tab-panel__tabs-item:focus:not( :disabled ) {
		box-shadow: inset 0 -2px 0 0 var( --wp-admin-theme-color );
		color: var( --studio-gray-100 );
	}
`;

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
		<SitesTabPanel
			className={ className }
			initialTabName={ initialTabName }
			tabs={ tabs as TabPanel.Tab[] }
			onSelect={ ( tabName ) => {
				page(
					'all' === tabName
						? removeQueryArgs( window.location.pathname + window.location.search, 'status' )
						: addQueryArgs( window.location.pathname + window.location.search, { status: tabName } )
				);
			} }
		>
			{ () => renderContents( filteredSites, filterOptions ) }
		</SitesTabPanel>
	);
}
