import { ThemesToolbarGroupItem } from 'calypso/my-sites/themes/themes-toolbar-group/types';
import { STATIC_FILTERS } from 'calypso/my-sites/themes/v2/data/filters';
import { useSelector } from 'calypso/state';
import { getThemeFilterTerms } from 'calypso/state/themes/selectors';

type UseThemeShowcaseFiltersProps = {
	includeMyThemes?: boolean;
};

type FilterTerm = {
	name: string;
	description: string;
};

const mapFilterTermsToToolbarGroupItems = (
	filters: Record< string, FilterTerm >
): Array< ThemesToolbarGroupItem > =>
	Object.entries( filters ).map( ( [ key, filter ] ) => ( {
		key,
		text: filter.name,
	} ) );

export default (
	props: UseThemeShowcaseFiltersProps = { includeMyThemes: false }
): Array< ThemesToolbarGroupItem > => {
	//useQueryThemeFilters();
	const { includeMyThemes } = props;
	const themeShowcaseFilters = useSelector(
		( state ) => getThemeFilterTerms( state, 'subject' ) || {}
	);
	const themeShowcaseFiltersAsTerms = mapFilterTermsToToolbarGroupItems(
		themeShowcaseFilters as Record< string, FilterTerm >
	);

	return [
		STATIC_FILTERS.RECOMMENDED,
		STATIC_FILTERS.ALL,
		...( includeMyThemes ? [ STATIC_FILTERS.MY_THEMES ] : [] ),
		...themeShowcaseFiltersAsTerms,
	];
};
