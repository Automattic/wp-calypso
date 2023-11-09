import { recordTracksEvent } from '@automattic/calypso-analytics';
import { property, snakeCase } from 'lodash';
import { useSelector } from 'calypso/state';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getThemeType, isThemeActive } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useThemeCollectionContext } from '../theme-collection-context';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';

export default function useThemeShowcaseTracks() {
	const { position, selectedStyleVariation, themeId } = useThemeContext();
	const { position: collectionPosition, collectionId } = useThemeCollectionContext();

	const siteId = useSelector( getSelectedSiteId );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId, siteId ) );
	const themeType = useSelector( ( state ) => getThemeType( state, themeId ) );

	const { filterString, query, themes } = useThemeShowcaseContext();
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
	const recordThemeClick = ( event, { action = '', styleVariationSlug } = {} ) => {
		const adjustedPosition = position + 1;

		const collectionProps =
			'' !== collectionId
				? {
						collection: collectionId,
						collection_index: ( collectionPosition || 0 ) + 1,
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
			style_variation: styleVariationSlug || selectedStyleVariation?.slug || '@theme',
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
