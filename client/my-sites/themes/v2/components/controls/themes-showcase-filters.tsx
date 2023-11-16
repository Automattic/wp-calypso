import { useContext } from 'react';
import ThemesToolbarGroup from 'calypso/my-sites/themes/themes-toolbar-group';
import ThemesShowcaseContext from 'calypso/my-sites/themes/v2/context/themes-showcase-context';
import useThemeShowcaseFilters from 'calypso/my-sites/themes/v2/hooks/use-theme-showcase-filters';
import { categoryFromString, isCategory } from 'calypso/my-sites/themes/v2/types';
import navigateTo from 'calypso/my-sites/themes/v2/util/navigate-to';

export default () => {
	const { filter, tier, search, category, setFilter, setCategory } =
		useContext( ThemesShowcaseContext );
	const themeShowcaseFilters = useThemeShowcaseFilters();

	const onSelect = ( newFilter: string | null ) => {
		const navigationParams = { tier, search, category: categoryFromString( category ) };

		if ( isCategory( newFilter ) ) {
			setCategory( newFilter );
			setFilter( '' );
			navigateTo( { ...navigationParams, category: newFilter } );
		} else {
			setFilter( newFilter ?? '' );
			navigateTo( { ...navigationParams, filter: newFilter as string } );
		}
	};

	return (
		<ThemesToolbarGroup
			items={ themeShowcaseFilters }
			selectedKey={ filter }
			onSelect={ onSelect }
		/>
	);
};
