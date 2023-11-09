import page from 'page';
import { useSelector } from 'calypso/state';
import { getThemeDetailsUrl } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';
import useThemeShowcaseTracks from './use-theme-showcase-tracks';

export default function useSelectedStyleVariation() {
	const { selectedStyleVariation, setSelectedStyleVariation, themeId } = useThemeContext();
	const { tabFilter } = useThemeShowcaseContext();

	const siteId = useSelector( getSelectedSiteId );
	const themeDetailsUrl = useSelector( ( state ) =>
		getThemeDetailsUrl( state, themeId, siteId, {
			styleVariationSlug: selectedStyleVariation?.slug,
			tabFilter,
		} )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	const onStyleVariationClick = ( styleVariation ) => {
		recordThemeClick( 'calypso_themeshowcase_theme_style_variation_click', {
			styleVariationSlug: styleVariation?.slug,
		} );
		setSelectedStyleVariation( styleVariation );
	};
	const onStyleVariationMoreClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_style_variation_more_click' );
		page( themeDetailsUrl );
	};

	return { onStyleVariationClick, onStyleVariationMoreClick };
}
