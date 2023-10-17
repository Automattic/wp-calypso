import { memo } from 'react';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import ShowcaseThemeCollection from 'calypso/my-sites/themes/collections/showcase-theme-collection';

export interface ThemeCollectionsLayoutProps {
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
	onSeeAll: ( filters: object ) => void;
}

function ThemeCollectionsLayout( props: ThemeCollectionsLayoutProps ) {
	const { onSeeAll, ...rest } = props;

	return (
		<>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.premium }
				{ ...rest }
				onSeeAll={ () => onSeeAll( { tier: 'premium' } ) }
			/>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.partner }
				{ ...rest }
				onSeeAll={ () => onSeeAll( { tier: 'marketplace' } ) }
			/>
		</>
	);
}

export default memo( ThemeCollectionsLayout );
