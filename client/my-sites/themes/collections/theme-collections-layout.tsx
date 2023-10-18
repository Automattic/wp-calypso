import { memo } from 'react';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import ShowcaseThemeCollection from 'calypso/my-sites/themes/collections/showcase-theme-collection';

type OnSeeAll = {
	tier?: string;
	filter?: string;
};

export interface ThemeCollectionsLayoutProps {
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
	onSeeAll: ( object: OnSeeAll ) => void;
}

function ThemeCollectionsLayout( props: ThemeCollectionsLayoutProps ) {
	const { onSeeAll } = props;

	const collections = Object.values( THEME_COLLECTIONS ).map( ( collection ) => {
		const { filter, tier } = collection.query;
		return (
			<ShowcaseThemeCollection
				key={ collection.collectionSlug }
				{ ...collection }
				{ ...props }
				onSeeAll={ () => onSeeAll( { tier, filter } ) }
			/>
		);
	} );

	return <>{ collections }</>;
}

export default memo( ThemeCollectionsLayout );
