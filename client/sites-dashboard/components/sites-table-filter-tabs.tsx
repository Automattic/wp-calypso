import styled from '@emotion/styled';
import { TabPanel } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import SitesBadge from './sites-badge';
import type { SiteData } from 'calypso/state/ui/selectors/site-data'; // eslint-disable-line no-restricted-imports

interface SitesTableFilterTabsProps {
	allSites: SiteData[];
	children( filteredSites: SiteData[], queryParams: SitesTableQueryParams ): JSX.Element;
	className?: string;
	queryParams: SitesTableQueryParams;
}

interface SitesTableQueryParams {
	status?: string;
	search?: string;
}

interface FilteredSites {
	[ name: string ]: SiteData[];
}

interface SiteTab extends Omit< TabPanel.Tab, 'title' > {
	title: React.ReactChild;
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
	queryParams,
}: SitesTableFilterTabsProps ) {
	const { __ } = useI18n();

	let tabs: SiteTab[] = [
		{ name: 'all', title: __( 'All' ) },
		{ name: 'launched', title: __( 'Launched' ) },
		{ name: 'private', title: __( 'Private' ) },
		{ name: 'coming-soon', title: __( 'Coming soon' ) },
	];

	const initialTabName = tabs.find( ( tab ) => tab.name === queryParams.status )
		? queryParams.status
		: undefined;

	const filteredSites: FilteredSites = tabs.reduce(
		( acc, { name } ) => ( { ...acc, [ name ]: filterSites( allSites, name ) } ),
		{}
	);

	tabs = tabs.map( ( { name, title } ) => ( {
		name,
		title: (
			<>
				{ title }
				<SitesBadge>{ filteredSites[ name ].length }</SitesBadge>
			</>
		),
		queryParams: queryParams,
	} ) );

	return (
		<SitesTabPanel
			className={ className }
			initialTabName={ initialTabName }
			tabs={ tabs as TabPanel.Tab[] }
			onSelect={ ( tabName ) => {
				window.history.pushState(
					{},
					'',
					'all' === tabName
						? removeQueryArgs( window.location.pathname + window.location.search, 'status' )
						: addQueryArgs( window.location.pathname + window.location.search, { status: tabName } )
				);
			} }
		>
			{ ( tab ) => renderContents( filteredSites[ tab.name ], tab.queryParams ) }
		</SitesTabPanel>
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
