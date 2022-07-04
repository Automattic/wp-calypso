import styled from '@emotion/styled';
import { TabPanel as WPTabPanel } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import Badge from '../badge';
import type { SiteData } from 'calypso/state/ui/selectors/site-data'; // eslint-disable-line no-restricted-imports

interface SitesTableFilterTabsProps {
	allSites: SiteData[];
	children( filteredSites: SiteData[] ): JSX.Element;
	className?: string;
}

interface Tab {
	name: string;
	title: string | Element;
}

interface FilteredSites {
	[ name: string ]: SiteData[];
}

const TabPanel = styled( WPTabPanel )`
	.components-tab-panel__tabs-item {
		--wp-admin-theme-color: var( --studio-gray-100 );
		color: var( --studio-gray-60 );
		padding: 0;
		margin-right: 24px;
		font-size: 16px;
	}
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
}: SitesTableFilterTabsProps ) {
	const { __ } = useI18n();

	let tabs: Tab[] = [
		{ name: 'all', title: __( 'All', __i18n_text_domain__ ) },
		{ name: 'launched', title: __( 'Launched', __i18n_text_domain__ ) },
		{ name: 'private', title: __( 'Private', __i18n_text_domain__ ) },
		{ name: 'coming-soon', title: __( 'Coming soon', __i18n_text_domain__ ) },
	];

	const filteredSites: FilteredSites = tabs.reduce(
		( acc, { name } ) => ( { ...acc, [ name ]: filterSites( allSites, name ) } ),
		{}
	);

	tabs = tabs.map( ( { name, title } ) => ( {
		name,
		title: (
			<>
				{ title }
				<Badge>{ filteredSites[ name ].length }</Badge>
			</>
		),
	} ) );

	return (
		<TabPanel className={ className } tabs={ tabs }>
			{ ( tab ) => renderContents( filteredSites[ tab.name ] ) }
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
