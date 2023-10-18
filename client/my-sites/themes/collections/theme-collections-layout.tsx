import { memo } from 'react';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import ShowcaseThemeCollection from 'calypso/my-sites/themes/collections/showcase-theme-collection';

type OnSeeAll = {
	tier?: 'premium' | 'marketplace';
	filter?: 'blog' | 'portfolio' | 'business' | 'art-design';
};

export interface ThemeCollectionsLayoutProps {
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
	onSeeAll: ( object: OnSeeAll ) => void;
}

function ThemeCollectionsLayout( props: ThemeCollectionsLayoutProps ) {
	const { onSeeAll } = props;

	return (
		<>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.premium }
				{ ...props }
				onSeeAll={ () => onSeeAll( { tier: 'premium' } ) }
			/>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.partner }
				{ ...props }
				onSeeAll={ () => onSeeAll( { tier: 'marketplace' } ) }
			/>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.blog }
				{ ...props }
				onSeeAll={ () => onSeeAll( { filter: 'blog' } ) }
			/>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.portfolio }
				{ ...props }
				onSeeAll={ () => onSeeAll( { filter: 'portfolio' } ) }
			/>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.business }
				{ ...props }
				onSeeAll={ () => onSeeAll( { filter: 'business' } ) }
			/>
			<ShowcaseThemeCollection
				{ ...THEME_COLLECTIONS.artAndDesign }
				{ ...props }
				onSeeAll={ () => onSeeAll( { filter: 'art-design' } ) }
			/>
		</>
	);
}

export default memo( ThemeCollectionsLayout );
