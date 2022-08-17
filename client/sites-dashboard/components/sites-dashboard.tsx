import { Button, useSitesTableFiltering, useSitesTableSorting } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo } from 'react';
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
const pagePadding = {
	paddingLeft: '32px',
	paddingRight: '32px',
};

const PageHeader = styled.div( {
	...pagePadding,

	backgroundColor: 'var( --studio-white )',
	paddingTop: '24px',
	paddingBottom: '24px',
	boxShadow: 'inset 0px -1px 0px rgba( 0, 0, 0, 0.05 )',
} );

const PageBodyWrapper = styled.div( {
	...pagePadding,
	maxWidth: MAX_PAGE_WIDTH,
	margin: '0 auto',
} );

const HeaderControls = styled.div( {
	maxWidth: MAX_PAGE_WIDTH,
	margin: '0 auto',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
} );

const DashboardHeading = styled.h1( {
	fontWeight: 500,
	fontSize: '20px',
	lineHeight: '26px',
	color: 'var( --studio-gray-100 )',
	flex: 1,
} );

const sitesMargin = css( {
	margin: '0 0 1.5em',
} );

const HiddenSitesMessageContainer = styled.div( {
	color: 'var( --color-text-subtle )',
	fontSize: '14px',
	padding: '16px 0 24px 0',
	textAlign: 'center',
} );

const HiddenSitesMessage = styled.div( {
	marginBottom: '1em',
} );

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
		status,
	} );

	const selectedStatus = statuses.find( ( { name } ) => name === status ) || statuses[ 0 ];

	const [ displayMode, setDisplayMode ] = useSitesDisplayMode();

	const hasSites = filteredSites.hidden.length > 0 || filteredSites.visible.length > 0;

	const sitesList = useMemo( () => {
		return showHidden
			? [ ...filteredSites.visible, ...filteredSites.hidden ]
			: filteredSites.visible;
	}, [ showHidden, filteredSites ] );

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
					{ hasSites || isLoading ? (
						<>
							{ displayMode === 'list' && (
								<>
									<SitesTable
										showVisibilityColumn={ showHidden }
										isLoading={ isLoading }
										sites={ sitesList }
										className={ sitesMargin }
									/>
								</>
							) }
							{ displayMode === 'tile' && (
								<>
									<SitesGrid
										showVisibilityIndicator={ showHidden }
										isLoading={ isLoading }
										sites={ sitesList }
										className={ sitesMargin }
									/>
								</>
							) }
							{ ! showHidden && filteredSites.hidden.length > 0 && (
								<HiddenSitesMessageContainer>
									<HiddenSitesMessage>
										{ sprintf(
											/* translators: the `hiddenSitesCount` field will be a number greater than 0 */
											_n(
												'%(hiddenSitesCount)d site is hidden from the list. Use search to access it.',
												'%(hiddenSitesCount)d sites are hidden from the list. Use search to access them.',
												filteredSites.hidden.length
											),
											{
												hiddenSitesCount: filteredSites.hidden.length,
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
