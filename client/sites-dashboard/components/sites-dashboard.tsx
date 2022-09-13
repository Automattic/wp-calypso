import {
	Button,
	Gridicon,
	useSitesTableFiltering,
	useSitesTableSorting,
	useScrollToTop,
} from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useCallback, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Pagination from 'calypso/components/pagination';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { MEDIA_QUERIES } from '../utils';
import { NoSitesMessage } from './no-sites-message';
import {
	SitesDashboardQueryParams,
	SitesContentControls,
	handleQueryParamChange,
} from './sites-content-controls';
import { useSitesDisplayMode } from './sites-display-mode-switcher';
import { SitesGrid } from './sites-grid';
import { parseSorting, useSitesListSorting } from './sites-list-sorting-dropdown';
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

const PageBodyBottomContainer = styled.div( {
	color: 'var( --color-text-subtle )',
	paddingBlockStart: '16px',
	paddingBlockEnd: '24px',
	gap: '24px',
	display: 'flex',
	flexDirection: 'column',
	[ MEDIA_QUERIES.mediumOrSmaller ]: {
		paddingBlockEnd: '48px',
	},
} );

const HiddenSitesMessageContainer = styled.div( {
	fontSize: '14px',
	paddingInline: 0,
	textAlign: 'center',
} );

const HiddenSitesMessage = styled.div( {
	marginBlockEnd: '1em',
} );

const ScrollButton = styled( Button, { shouldForwardProp: ( prop ) => prop !== 'visible' } )< {
	visible: boolean;
} >`
	position: fixed;
	display: flex;
	opacity: ${ ( props ) => ( props.visible ? 1 : 0 ) };
	align-items: center;
	justify-content: center;
	inset-block-end: 24px;
	inset-inline-start: 24px;
	height: 42px;
	width: 42px;
	background-color: #000;
	color: #fff;
	border-radius: 4px;
	transition: opacity 0.3s ease-in-out;
	.gridicon {
		top: initial;
		margin-top: initial;
	}
`;

export function SitesDashboard( {
	queryParams: { page = 1, perPage = 96, search, showHidden, status = 'all' },
}: SitesDashboardProps ) {
	const { __, _n } = useI18n();

	const { data: allSites = [], isLoading } = useSiteExcerptsQuery();

	const { filteredSites, statuses } = useSitesTableFiltering( allSites, {
		search,
		showHidden: search ? true : showHidden,
		status,
	} );

	const [ sitesListSorting, onSitesListSortingChange ] = useSitesListSorting();

	const { sortedSites } = useSitesTableSorting(
		sitesListSorting === 'none' ? [] : filteredSites,
		parseSorting( sitesListSorting )
	);

	const paginatedSites = sortedSites.slice( ( page - 1 ) * perPage, page * perPage );

	const selectedStatus = statuses.find( ( { name } ) => name === status ) || statuses[ 0 ];

	const [ displayMode, setDisplayMode ] = useSitesDisplayMode();

	const userPreferencesLoaded = 'none' !== sitesListSorting && 'none' !== displayMode;

	const elementRef = useRef( window );

	const isBelowThreshold = useCallback( ( containerNode: Window ) => {
		const SCROLL_THRESHOLD = containerNode.innerHeight;

		return containerNode.scrollY > SCROLL_THRESHOLD;
	}, [] );

	const { isButtonVisible, scrollToTop } = useScrollToTop( {
		scrollTargetRef: elementRef,
		isBelowThreshold,
		smoothScrolling: true,
	} );

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
							sitesListSorting={ sitesListSorting }
							onSitesListSortingChange={ onSitesListSortingChange }
						/>
					) }
					{ userPreferencesLoaded && (
						<>
							{ paginatedSites.length > 0 || isLoading ? (
								<>
									{ displayMode === 'list' && (
										<SitesTable
											isLoading={ isLoading }
											sites={ paginatedSites }
											className={ sitesMargin }
										/>
									) }
									{ displayMode === 'tile' && (
										<SitesGrid
											isLoading={ isLoading }
											sites={ paginatedSites }
											className={ sitesMargin }
										/>
									) }
									{ ( selectedStatus.hiddenCount > 0 || filteredSites.length > perPage ) && (
										<PageBodyBottomContainer>
											<Pagination
												page={ page }
												perPage={ perPage }
												total={ filteredSites.length }
												pageClick={ ( newPage: number ) => {
													handleQueryParamChange( { page: newPage } );
												} }
											/>
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
													<Button
														href={ addQueryArgs( window.location.href, {
															'show-hidden': 'true',
														} ) }
													>
														{ __( 'Show all' ) }
													</Button>
												</HiddenSitesMessageContainer>
											) }
										</PageBodyBottomContainer>
									) }
								</>
							) : (
								<NoSitesMessage
									status={ selectedStatus.name }
									statusSiteCount={ selectedStatus.count }
								/>
							) }
						</>
					) }
				</>
			</PageBodyWrapper>
			<ScrollButton
				onClick={ scrollToTop }
				visible={ isButtonVisible }
				title={ __( 'Scroll to top' ) }
				aria-label={ __( 'Scroll to top' ) }
			>
				<Gridicon icon={ 'arrow-up' } size={ 18 } />
			</ScrollButton>
		</main>
	);
}
