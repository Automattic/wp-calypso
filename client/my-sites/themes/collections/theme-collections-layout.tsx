import { memo } from 'react';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import ShowcaseThemeCollection from 'calypso/my-sites/themes/collections/showcase-theme-collection';

export interface ThemeCollectionsLayoutProps {
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
}

function ThemeCollectionsLayout( props: ThemeCollectionsLayoutProps ) {
	return (
		<>
			<ShowcaseThemeCollection { ...THEME_COLLECTIONS.premium } { ...props } />
			<ShowcaseThemeCollection { ...THEME_COLLECTIONS.partner } { ...props } />
		</>
	);
}

export default memo( ThemeCollectionsLayout );
