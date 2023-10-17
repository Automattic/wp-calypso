import { memo } from 'react';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import ShowcaseThemeCollection from 'calypso/my-sites/themes/collections/showcase-theme-collection';

export interface ThemeCollectionsLayoutProps {
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
	onTierSelect: ( tier: string ) => void;
}

function ThemeCollectionsLayout( props: ThemeCollectionsLayoutProps ) {
	const { onTierSelect } = props;

	return (
		<>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.premium }
				{ ...props }
				onSeeAll={ () => onTierSelect( 'premium' ) }
			/>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.partner }
				{ ...props }
				onSeeAll={ () => onTierSelect( 'marketplace' ) }
			/>
		</>
	);
}

export default memo( ThemeCollectionsLayout );
