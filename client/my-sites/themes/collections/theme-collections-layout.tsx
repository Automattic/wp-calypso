import { memo } from 'react';
import {
	THEME_COLLECTIONS,
	ThemeCollectionDefinition,
} from 'calypso/my-sites/themes/collections/collection-definitions';
import ShowcaseThemeCollection from 'calypso/my-sites/themes/collections/showcase-theme-collection';
import './style.scss';

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

const collections: Array< ThemeCollectionDefinition > = Object.values( THEME_COLLECTIONS );

function ThemeCollectionsLayout( props: ThemeCollectionsLayoutProps ) {
	const { onSeeAll } = props;

	return collections.map( ( collection, index ) => {
		const { filter, tier } = collection.query;
		return (
			<ShowcaseThemeCollection
				key={ collection.collectionSlug }
				{ ...collection }
				{ ...props }
				onSeeAll={ () => onSeeAll( { tier, filter } ) }
				collectionIndex={ index }
			/>
		);
	} );
}

export default memo( ThemeCollectionsLayout );
