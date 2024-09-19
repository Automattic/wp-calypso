import { recordTracksEvent } from '@automattic/calypso-analytics';
import { snakeCase } from 'lodash';

type ThemeSearchQuery = {
	search: string;
	tier: string;
	filter: string;
	page: number;
	number: number;
};

type Theme = {
	id: string;
};

enum ThemeShowcaseEventType {
	ThemeClick = 'calypso_themeshowcase_theme_click',
	ThemeStyleVariationClick = 'calypso_themeshowcase_theme_style_variation_click',
	ThemeStyleVariationMoreClick = 'calypso_themeshowcase_theme_style_variation_more_click',
}

const getThemeShowcaseEventRecorder = (
	query: ThemeSearchQuery,
	themes: Array< Theme >,
	filterString: string,
	getThemeType: ( themeId: string ) => string,
	getThemeTierForTheme: ( themeId: string ) => object,
	isActiveTheme: ( themeId: string ) => boolean,
	defaultCollectionId: string | null = null,
	defaultCollectionIndex: number | null = null
) => {
	const getEventRecorder =
		( event: ThemeShowcaseEventType ) =>
		(
			themeId: string,
			themePosition: number,
			action: string = '',
			styleVariation: string = '@theme',
			collectionId: string | null = null,
			collectionIndex: number | null = null
		) => {
			const adjustedPosition = themePosition + 1;
			const isCollection = null !== defaultCollectionId || null !== collectionIndex;

			recordTracksEvent( event, {
				search: query?.search,
				tier: query?.tier,
				filter: query?.filter,
				search_taxonomies: filterString,
				search_term: filterString + ( query?.search || '' ),
				theme: themeId,
				is_active_theme: isActiveTheme( themeId ),
				style_variation: styleVariation,
				results_rank: adjustedPosition,
				results: themes?.map( ( theme ) => theme.id ).join() ?? [],
				page_number: query?.page || null,
				theme_on_page: Math.floor( adjustedPosition / query.number ),
				action: snakeCase( action ),
				theme_type: getThemeType( themeId ),
				// @ts-expect-error Tiers are not yet typed
				theme_tier: getThemeTierForTheme( themeId )?.slug,
				is_collection: isCollection,
				...( isCollection
					? {
							collection_index: ( defaultCollectionIndex || collectionIndex || 0 ) + 1,
							collection: defaultCollectionId || collectionId,
					  }
					: {} ),
			} );
		};

	return {
		recordThemeClick: getEventRecorder( ThemeShowcaseEventType.ThemeClick ),
		recordThemeStyleVariationClick: getEventRecorder(
			ThemeShowcaseEventType.ThemeStyleVariationClick
		),
		recordThemesStyleVariationMoreClick: getEventRecorder(
			ThemeShowcaseEventType.ThemeStyleVariationMoreClick
		),
	};
};

export { getThemeShowcaseEventRecorder, ThemeShowcaseEventType };
