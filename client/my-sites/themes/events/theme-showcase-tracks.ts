import { recordTracksEvent } from '@automattic/calypso-analytics';
import { property, snakeCase } from 'lodash';

type ThemeSearchQuery = {
	search: string;
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
	filterString: string,
	themes: Array< Theme >,
	getThemeType: ( themeId: string ) => string,
	isActiveTheme: ( themeId: string ) => boolean
) => {
	const getEventRecorder =
		( event: ThemeShowcaseEventType ) =>
		(
			themeId: string,
			themePosition: number,
			action: string = '',
			styleVariation: string = '@theme',
			isCollection: boolean = false
		) => {
			const adjustedPosition = themePosition + 1;

			recordTracksEvent( event, {
				search_term: filterString + query?.search || null,
				search_taxonomies: filterString,
				theme: themeId,
				is_active_theme: isActiveTheme( themeId ),
				style_variation: styleVariation,
				results_rank: adjustedPosition,
				results: themes.map( property( 'id' ) ).join(),
				page_number: query?.page || null,
				theme_on_page: Math.floor( adjustedPosition / query.number ),
				action: snakeCase( action ),
				theme_type: getThemeType( themeId ),
				is_collection: isCollection,
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
