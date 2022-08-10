import { Button, useSitesTableFiltering, useSitesTableSorting } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
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

const HiddenSitesMessage = styled.span`
	color: var( --color-text-subtle );
	display: block;
	font-size: 14px;
	padding: 16px 16px 24px;

	a {
		text-decoration: underline;

		&:hover {
			text-decoration: none;
		}
	}
`;

export function SitesDashboard( {
	queryParams: { search, showHidden, status = 'all' },
}: SitesDashboardProps ) {
	const { __ } = useI18n();
	const translate = useTranslate();

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

	const currentUrlWithShowHidden = addQueryArgs( window.location.href, { 'show-hidden': 'true' } );

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
								<SitesTable isLoading={ isLoading } sites={ filteredSites } />
							) }
							{ displayMode === 'tile' && (
								<SitesGrid isLoading={ isLoading } sites={ filteredSites } />
							) }
							{ selectedStatus.hiddenCount && (
								<HiddenSitesMessage>
									{ translate(
										'%(hiddenSitesCount)d more hidden site. {{a}}Change{{/a}}.{{br/}}Use search to access it.',
										'%(hiddenSitesCount)d more hidden sites. {{a}}Change{{/a}}.{{br/}}Use search to access them.',
										{
											count: selectedStatus.hiddenCount,
											args: {
												hiddenSitesCount: selectedStatus.hiddenCount,
											},
											components: {
												br: <br />,
												a: <a href={ currentUrlWithShowHidden } />,
											},
										}
									) }
								</HiddenSitesMessage>
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
