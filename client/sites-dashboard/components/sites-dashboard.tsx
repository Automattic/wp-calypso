import { Button, useSitesTableFiltering, useSitesTableSorting } from '@automattic/components';
import { css as cssClassName } from '@emotion/css';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { NoSitesMessage } from './no-sites-message';
import { SitesDashboardQueryParams, SitesContentControls } from './sites-content-controls';
import { useSitesDisplayMode } from './sites-display-mode-switcher';
import { SitesGrid } from './sites-grid';
import { SitesTable } from './sites-table';

interface SitesDashboardProps {
	queryParams: SitesDashboardQueryParams;
}

const MAX_PAGE_WIDTH = '1280px';

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
	padding-top: 24px;
	padding-bottom: 24px;
	box-shadow: inset 0px -1px 0px rgba( 0, 0, 0, 0.05 );
`;

const PageBodyWrapper = styled.div`
	${ pagePadding }
	max-width: ${ MAX_PAGE_WIDTH };
	margin: 0 auto;
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

const sitesMargin = cssClassName( {
	margin: '0 0 1.5em',
} );

const HiddenSitesMessageContainer = styled.div`
	color: var( --color-text-subtle );
	font-size: 14px;
	padding: 16px 0 24px 0;
	text-align: center;
`;

const HiddenSitesMessage = styled.div`
	margin-bottom: 1em;
`;

export function SitesDashboard( {
	queryParams: { search, showHidden, status = 'all' },
}: SitesDashboardProps ) {
	const { __, _n } = useI18n();

	const { data: allSites = [], isLoading } = useSiteExcerptsQuery();

	const { sortedSites } = useSitesTableSorting( allSites, {
		sortKey: 'updated-at',
		sortOrder: 'desc',
	} );

	const { filteredSites, statuses } = useSitesTableFiltering( sortedSites, {
		search,
		showHidden: search ? true : showHidden,
		status,
	} );

	const selectedStatus = statuses.find( ( { name } ) => name === status ) || statuses[ 0 ];

	const [ displayMode, setDisplayMode ] = useSitesDisplayMode();

	return (
		<main>
			<DocumentHead title={ __( 'My Sites' ) } />
			<PageHeader>
				<HeaderControls>
					<DashboardHeading>{ __( 'My Sites' ) }</DashboardHeading>
					<Button primary href="/start?source=sites-dashboard&ref=sites-dashboard">
						<span>{ __( 'Add new site' ) }</span>
					</Button>
				</HeaderControls>
			</PageHeader>
			<PageBodyWrapper>
				<>
					{ ( allSites.length > 0 || isLoading ) && (
						<SitesContentControls
							initialSearch={ search }
							statuses={ statuses }
							selectedStatus={ selectedStatus }
							displayMode={ displayMode }
							onDisplayModeChange={ setDisplayMode }
						/>
					) }
					{ filteredSites.length > 0 || isLoading ? (
						<>
							{ displayMode === 'list' && (
								<SitesTable
									isLoading={ isLoading }
									sites={ filteredSites }
									className={ sitesMargin }
								/>
							) }
							{ displayMode === 'tile' && (
								<SitesGrid
									isLoading={ isLoading }
									sites={ filteredSites }
									className={ sitesMargin }
								/>
							) }
							{ selectedStatus.hiddenCount > 0 && (
								<HiddenSitesMessageContainer>
									<HiddenSitesMessage>
										{ sprintf(
											/* translators: the `hiddenSitesCount` field will be a number greater than 0 */
											_n(
												'%(hiddenSitesCount)d site is hidden from the list. Use search to access it.',
												'%(hiddenSitesCount)d sites are hidden from the list. Use search to access them.',
												selectedStatus.hiddenCount
											),
											{
												hiddenSitesCount: selectedStatus.hiddenCount,
											}
										) }
									</HiddenSitesMessage>
									<Button href={ addQueryArgs( window.location.href, { 'show-hidden': 'true' } ) }>
										{ __( 'Show all' ) }
									</Button>
								</HiddenSitesMessageContainer>
							) }
						</>
					) : (
						<NoSitesMessage
							status={ selectedStatus.name }
							statusSiteCount={ selectedStatus.count }
						/>
					) }
				</>
			</PageBodyWrapper>
		</main>
	);
}
