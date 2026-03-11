import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useQueryThemes } from 'calypso/components/data/query-themes';
import { ThemeBlock } from 'calypso/components/themes-list';
import { buildRelativeSearchUrl } from 'calypso/lib/build-url';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import { useThemeCollection } from 'calypso/my-sites/themes/collections/use-theme-collection';
import { getThemeShowcaseEventRecorder } from 'calypso/my-sites/themes/events/theme-showcase-tracks';
import { trackClick } from 'calypso/my-sites/themes/helpers';
import ThemeSectionHeader from 'calypso/my-sites/themes/sections-modern/theme-section-header';
import { useSelector } from 'calypso/state';
import {
	getThemesForQueryIgnoringPage,
	isRequestingThemesForQuery,
} from 'calypso/state/themes/selectors';
import SearchMoreOptions from './search-more-options';
import type { ThemesQuery } from 'calypso/my-sites/themes/collections/use-theme-collection';
import type { Theme } from 'calypso/types';

import './style.scss';

const WPORG_THEMES_LIMIT = 6;

interface SearchResultsModernProps {
	search: string;
	filter: string;
	tier: string;
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
}

export default function SearchResultsModern( {
	search,
	filter,
	tier,
	getActionLabel,
	getOptions,
	getScreenshotUrl,
}: SearchResultsModernProps ) {
	const translate = useTranslate();

	const wpcomQuery: ThemesQuery = useMemo(
		() => ( {
			search,
			filter,
			tier,
			number: 100,
			page: 1,
		} ),
		[ search, filter, tier ]
	);

	// Append filter terms to search string for wporg (same logic as ThemesSelection).
	const wporgQuery = useMemo(
		() => ( {
			...wpcomQuery,
			page: 1,
			search: filter
				? `${ search } ${ filter.replaceAll( 'subject:', '' ).replace( /[+-]/g, ' ' ) }`
				: search,
		} ),
		[ wpcomQuery, search, filter ]
	);

	// Fetch themes from both sources.
	useQueryThemes( 'wpcom', wpcomQuery );
	useQueryThemes( 'wporg', wporgQuery );

	// Get wpcom themes.
	const {
		getPrice,
		themes: wpcomThemes,
		isActive,
		isInstalling,
		isLivePreviewStarted,
		siteId,
		getThemeType,
		getThemeTierForTheme,
		filterString,
		getThemeDetailsUrl,
	} = useThemeCollection( wpcomQuery );

	// Get wporg themes from Redux.
	const wporgThemes: Theme[] =
		useSelector( ( state ) => getThemesForQueryIgnoringPage( state, 'wporg', wporgQuery ) ) || [];

	const isLoadingWpcom = useSelector( ( state ) =>
		isRequestingThemesForQuery( state, 'wpcom', wpcomQuery )
	);
	const isLoadingWporg = useSelector( ( state ) =>
		isRequestingThemesForQuery( state, 'wporg', wporgQuery )
	);
	const isLoading = isLoadingWpcom || isLoadingWporg;

	const hasWpcomThemes = wpcomThemes.length > 0;
	const hasWporgThemes = wporgThemes.length > 0;
	const hasMoreWporgThemes = wporgThemes.length > WPORG_THEMES_LIMIT;
	const displayedWporgThemes = hasMoreWporgThemes
		? wporgThemes.slice( 0, WPORG_THEMES_LIMIT )
		: wporgThemes;
	const hasAnyThemes = hasWpcomThemes || hasWporgThemes;

	// Analytics for wpcom section.
	const wpcomEventRecorder = getThemeShowcaseEventRecorder(
		wpcomQuery,
		wpcomThemes,
		filterString,
		getThemeType,
		getThemeTierForTheme,
		isActive,
		'search-wpcom',
		0
	);

	// Analytics for wporg section.
	const wporgEventRecorder = getThemeShowcaseEventRecorder(
		wporgQuery,
		wporgThemes,
		filterString,
		getThemeType,
		getThemeTierForTheme,
		isActive,
		'search-wporg',
		1
	);

	const handleScreenshotClick = (
		recorder: ReturnType< typeof getThemeShowcaseEventRecorder >,
		themeId: string,
		resultsRank: number
	) => {
		trackClick( 'theme', 'screenshot' );
		recorder.recordThemeClick( themeId, resultsRank, 'screenshot_info' );
	};

	const handleStyleVariationClick = (
		recorder: ReturnType< typeof getThemeShowcaseEventRecorder >,
		themeId: string,
		resultsRank: number,
		variation: { slug: string }
	) => {
		recorder.recordThemeClick( themeId, resultsRank, 'style_variation', variation?.slug );
		if ( variation ) {
			recorder.recordThemeStyleVariationClick( themeId, resultsRank, '', variation.slug );
		} else {
			recorder.recordThemesStyleVariationMoreClick( themeId, resultsRank );
			const themeDetailsUrl = getThemeDetailsUrl( themeId );
			if ( themeDetailsUrl ) {
				page( themeDetailsUrl );
			}
		}
	};

	const renderThemeGrid = (
		themes: Theme[],
		recorder: ReturnType< typeof getThemeShowcaseEventRecorder >
	) => (
		<div className="search-results-modern__grid">
			{ themes.map( ( theme: Theme, index: number ) => (
				<ThemeBlock
					key={ theme.id }
					getActionLabel={ getActionLabel }
					getButtonOptions={ getOptions }
					getPrice={ getPrice }
					getScreenshotUrl={ getScreenshotUrl }
					index={ index }
					isActive={ isActive }
					isInstalling={ isInstalling }
					isLivePreviewStarted={ isLivePreviewStarted }
					siteId={ siteId }
					theme={ theme }
					onMoreButtonClick={ recorder.recordThemeClick }
					onMoreButtonItemClick={ recorder.recordThemeClick }
					onScreenshotClick={ ( themeId: string, resultsRank: number ) =>
						handleScreenshotClick( recorder, themeId, resultsRank )
					}
					onStyleVariationClick={ (
						themeId: string,
						resultsRank: number,
						variation: { slug: string }
					) => handleStyleVariationClick( recorder, themeId, resultsRank, variation ) }
				/>
			) ) }
		</div>
	);

	// While loading, don't render the "no results" state.
	if ( isLoading && ! hasAnyThemes ) {
		return null;
	}

	// No results.
	if ( ! hasAnyThemes ) {
		return (
			<div className="search-results-modern">
				<SearchMoreOptions
					title={ translate( 'No themes found' ) }
					subtitle={ translate( 'Try building your site another way.' ) }
					searchTerm={ search }
				/>
			</div>
		);
	}

	return (
		<div className="search-results-modern">
			{ hasWpcomThemes && (
				<div className="search-results-modern__section">
					<ThemeSectionHeader
						title={ translate( 'Results for "%(query)s"', { args: { query: search } } ) }
						subtitle=""
					/>
					{ renderThemeGrid( wpcomThemes, wpcomEventRecorder ) }
				</div>
			) }

			{ hasWporgThemes && (
				<div className="search-results-modern__section">
					<ThemeSectionHeader
						title={ translate( 'Community themes' ) }
						subtitle={ translate(
							'Explore "%(query)s" themes from the WordPress community, and upload to install when ready.',
							{ args: { query: search } }
						) }
						buttonLabel={ hasMoreWporgThemes ? translate( 'See all' ) : undefined }
						onButtonClick={
							hasMoreWporgThemes
								? () => {
										page(
											buildRelativeSearchUrl( THEME_COLLECTIONS.community.seeAllLink, search )
										);
										window.scrollTo( { top: 0 } );
								  }
								: undefined
						}
					/>
					{ renderThemeGrid( displayedWporgThemes, wporgEventRecorder ) }
				</div>
			) }

			<SearchMoreOptions
				title={ translate( 'More options to create your site' ) }
				searchTerm={ search }
			/>
		</div>
	);
}
