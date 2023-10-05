import { useTranslate } from 'i18n-calypso';
import { memo, ReactElement } from 'react';
import * as React from 'react';
import QueryThemes from 'calypso/components/data/query-themes';
import ThemeCollection, { CollectionListItem } from 'calypso/components/theme-collection';
import { useThemeCollection } from 'calypso/components/theme-collection/use-theme-collection';

const query = {
	collection: 'recommended',
	filter: '',
	number: 10,
	page: 1,
	search: '',
	tier: 'premium',
};

function PremiumThemesCollection( {
	children,
}: {
	children: ( collectionSlug: string, themeId: string, index: number ) => ReactElement;
} ): ReactElement {
	const translate = useTranslate();
	const { themes } = useThemeCollection( query );

	return (
		<>
			<QueryThemes query={ query } siteId="wpcom" />
			<ThemeCollection
				collectionSlug="premium-themes"
				heading={ translate( 'Premium Themes' ) }
				subheading={ <p>Lorem ipsum mockup subheading</p> }
			>
				{ themes &&
					themes.map( ( theme, index ) => (
						<CollectionListItem
							key={ theme.id }
							collectionSlug="premium-themes"
							themeId={ theme.id }
						>
							{ children( 'premium-themes', theme, index ) }
						</CollectionListItem>
					) ) }
			</ThemeCollection>
		</>
	);
}

export default memo( PremiumThemesCollection );
