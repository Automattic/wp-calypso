import {
	Button,
	Gridicon,
	TabPanel,
	useSitesTableFiltering,
	useSitesTableSorting,
} from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { removeQueryArgs, addQueryArgs } from '@wordpress/url';
import page from 'page';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { NoSitesMessage } from './no-sites-message';
import { SitesSearch } from './sites-search';
import { SitesSearchIcon } from './sites-search-icon';
import { SitesTable } from './sites-table';

interface SitesDashboardProps {
	queryParams: SitesDashboardQueryParams;
}

interface SitesDashboardQueryParams {
	status?: string;
	search?: string;
}

const MAX_PAGE_WIDTH = '1184px';

// Two wrappers are necessary (both pagePadding _and_ wideCentered) because we
// want there to be some padding that extends all around the page, but the header's
// background color and border needs to be able to extend into that padding.
const pagePadding = css`
	padding-left: 32px;
	padding-right: 32px;
`;

const wideCentered = css`
	max-width: ${ MAX_PAGE_WIDTH };
	margin: 0 auto;
`;

const PageHeader = styled.div`
	${ pagePadding }

	background-color: var( --studio-white );
	padding-top: 32px;
	box-shadow: inset 0px -1px 0px rgba( 0, 0, 0, 0.05 );

	// Leave enough space for the height of the TabPanel buttons (48px)
	padding-bottom: calc( 19px + 48px );
`;

const PageBodyWrapper = styled.div`
	${ pagePadding }
`;

const HeaderControls = styled.div`
	${ wideCentered }

	display: flex;
	flex-direction: row;
	align-items: center;
`;

const DashboardHeading = styled.h1`
	font-weight: 500;
	font-size: 20px;
	line-height: 26px;
	color: var( --studio-gray-100 );
	flex: 1;
`;

const SitesTableFilterTabs = styled( TabPanel )`
	${ wideCentered }
	position: relative;
	top: -48px;
`;

const SearchWrapper = styled.div`
	margin: 32px 0;
	width: 286px;
	max-width: 100%;
`;

export function SitesDashboard( { queryParams: { search, status } }: SitesDashboardProps ) {
	const { __ } = useI18n();

	const { data: allSites = [] } = useSiteExcerptsQuery();

	const { filteredSites, tabs, selectedTabHasSites } = useSitesTableFiltering( allSites, {
		search,
		status,
	} );

	const selectedTabName = tabs.find( ( tab ) => tab.name === status )?.name;

	const { sortedSites } = useSitesTableSorting( filteredSites, {
		sort: 'last-publish',
		order: 'desc',
	} );

	return (
		<main>
			<PageHeader>
				<HeaderControls>
					<DashboardHeading>{ __( 'My Sites' ) }</DashboardHeading>
					<Button primary href="/start?source=sites-dashboard&ref=sites-dashboard">
						<Gridicon icon="plus" />
						<span>{ __( 'New Site' ) }</span>
					</Button>
				</HeaderControls>
			</PageHeader>
			<PageBodyWrapper>
				<SitesTableFilterTabs
					tabs={ tabs }
					initialTabName={ selectedTabName }
					onSelect={ handleTabSelect }
				>
					{ () =>
						selectedTabHasSites ? (
							<>
								<SearchWrapper>
									<SitesSearch
										searchIcon={ <SitesSearchIcon /> }
										onSearch={ handleSearch }
										isReskinned
										placeholder={ __( 'Search by name or domain…' ) }
										defaultValue={ search }
									/>
								</SearchWrapper>
								{ sortedSites.length > 0 ? (
									<SitesTable sites={ sortedSites } />
								) : (
									<h2>{ __( 'No sites match your search.' ) }</h2>
								) }
							</>
						) : (
							<NoSitesMessage status={ selectedTabName } />
						)
					}
				</SitesTableFilterTabs>
			</PageBodyWrapper>
		</main>
	);
}

function handleTabSelect( tabName: string ) {
	page(
		'all' === tabName
			? removeQueryArgs( window.location.pathname + window.location.search, 'status' )
			: addQueryArgs( window.location.pathname + window.location.search, { status: tabName } )
	);
}

function handleSearch( rawTerm: string ) {
	const trimmedTerm = rawTerm.trim();
	if ( trimmedTerm.length ) {
		page(
			addQueryArgs( window.location.pathname + window.location.search, { search: trimmedTerm } )
		);
	} else {
		page( removeQueryArgs( window.location.pathname + window.location.search, 'search' ) );
	}
}
