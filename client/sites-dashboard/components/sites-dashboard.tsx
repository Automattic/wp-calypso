import { Button, Gridicon } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { NoSitesMessage } from './no-sites-message';
import { SearchableSitesTable } from './searchable-sites-table';
import { SitesTableFilterTabs } from './sites-table-filter-tabs';

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
const pagePadding = {
	paddingLeft: '32px',
	paddingRight: '32px',
};

const wideCentered = {
	maxWidth: MAX_PAGE_WIDTH,
	margin: '0 auto',
};

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

export function SitesDashboard( { queryParams }: SitesDashboardProps ) {
	const { __ } = useI18n();
	const { data: sites = [] } = useSiteExcerptsQuery();

	return (
		<main>
			<PageHeader>
				<HeaderControls>
					<DashboardHeading>{ __( 'My Sites' ) }</DashboardHeading>
					<Button primary href="/start?ref=sites-dashboard">
						<Gridicon icon="plus" />
						<span>{ __( 'New Site' ) }</span>
					</Button>
				</HeaderControls>
			</PageHeader>
			<PageBodyWrapper>
				<SitesTableFilterTabs
					allSites={ sites }
					className={ css`
						${ wideCentered }
						position: relative;
						top: -48px;
					` }
					filterOptions={ queryParams }
				>
					{ ( filteredSites, filterOptions ) =>
						filteredSites.length ? (
							<SearchableSitesTable sites={ filteredSites } initialSearch={ queryParams.search } />
						) : (
							<NoSitesMessage status={ filterOptions.status } />
						)
					}
				</SitesTableFilterTabs>
			</PageBodyWrapper>
		</main>
	);
}
