import { Button, useSitesTableFiltering, useSitesTableSorting } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { MEDIA_QUERIES } from '../utils';
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
	paddingInlineStart: '32px',
	paddingInlineEnd: '32px',

	[ MEDIA_QUERIES.mediumOrSmaller ]: {
		paddingInlineStart: '16px',
		paddingInlineEnd: '16px',
	},
};

const PageHeader = styled.div( {
	...pagePadding,

	backgroundColor: 'var( --studio-white )',

	paddingBlockStart: '24px',
	paddingBlockEnd: '24px',

	[ MEDIA_QUERIES.mediumOrSmaller ]: {
		padding: '16px',
	},

	boxShadow: 'inset 0px -1px 0px rgba( 0, 0, 0, 0.05 )',
} );

const PageBodyWrapper = styled.div( {
	...pagePadding,
	maxWidth: MAX_PAGE_WIDTH,
	marginBlock: 0,
	marginInline: 'auto',
} );

const HeaderControls = styled.div( {
	maxWidth: MAX_PAGE_WIDTH,
	marginBlock: 0,
	marginInline: 'auto',
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
	marginBlockStart: 0,
	marginInline: 0,
	marginBlockEnd: '1.5em',
} );

const HiddenSitesMessageContainer = styled.div( {
	color: 'var( --color-text-subtle )',
	fontSize: '14px',
	paddingInline: 0,
	paddingBlockStart: '16px',
	paddingBlockEnd: '24px',
	textAlign: 'center',
} );

const HiddenSitesMessage = styled.div( {
	marginBlockEnd: '1em',
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
		showHidden: search ? true : showHidden,
		status,
	} );

	const selectedStatus = statuses.find( ( { name } ) => name === status ) || statuses[ 0 ];

	const [ displayMode, setDisplayMode ] = useSitesDisplayMode();

	return (
		<main>
			<DocumentHead title={ __( 'Sites' ) } />
			<PageHeader>
				<HeaderControls>
					<DashboardHeading>{ __( 'Sites' ) }</DashboardHeading>
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
							{ selectedStatus.hiddenCount > 0 && 'none' !== displayMode && (
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
