import { recordTracksEvent } from '@automattic/calypso-analytics';
import { property, snakeCase } from 'lodash';
import { useContext } from 'react';
import { useSelector } from 'calypso/state';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getThemeType, isThemeActive } from 'calypso/state/themes/selectors';
import { useThemeContext } from '../theme-context';
import ThemeShowcaseContext from '../theme-showcase-context';

export default function useThemeShowcaseTracks() {
	const { position, themeId } = useThemeContext();

	const isActive = useSelector( ( state ) => isThemeActive( state, themeId ) );
	const themeType = useSelector( ( state ) => getThemeType( state, themeId ) );

	const { filterString, query, themes } = useContext( ThemeShowcaseContext );
	const {
		filter = DEFAULT_THEME_QUERY.filter,
		number = DEFAULT_THEME_QUERY.number,
		page = DEFAULT_THEME_QUERY.page,
		search = DEFAULT_THEME_QUERY.search,
		tier = DEFAULT_THEME_QUERY.tier,
	} = query;

	/**
	 * @todo Implement a Collection context
	 */
	const recordThemeClick = (
		event,
		{ action = '', collectionId = null, collectionIndex = null, styleVariationSlug = '' }
	) => {
		const adjustedPosition = position + 1;

		const collectionProps =
			null !== collectionId && null !== collectionIndex
				? {
						collection: collectionId,
						collection_index: ( collectionIndex || 0 ) + 1,
						is_collection: true,
				  }
				: {};

		const queryProps = {
			filter,
			search,
			search_taxonomies: filterString,
			search_term: filterString + ( search || '' ),
			tier,
		};

		const eventProps = {
			action: snakeCase( action ),
			is_active_theme: isActive,
			page_number: page || null,
			results: themes.map( property( 'id' ) ).join(),
			results_rank: adjustedPosition,
			style_variation: styleVariationSlug,
			theme: themeId,
			theme_on_page: Math.floor( adjustedPosition / number ),
			theme_type: themeType,
			...collectionProps,
			...queryProps,
		};

		recordTracksEvent( event, eventProps );
	};

	return { recordThemeClick };
}
