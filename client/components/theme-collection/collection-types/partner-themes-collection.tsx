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
	tier: 'marketplace',
};

function PartnerThemesCollection( {
	children,
}: {
	children: ( collectionSlug: string, themeId: string, index: number ) => ReactElement;
} ): ReactElement {
	const translate = useTranslate();
	const { themes } = useThemeCollection( query );

	const collectionSlug = 'partner-themes';
	return (
		<>
			<QueryThemes query={ query } siteId="wpcom" />
			<ThemeCollection
				collectionSlug={ collectionSlug }
				heading={ translate( 'Partner Themes' ) }
				subheading={ <p>Lorem ipsum mockup subheading</p> }
			>
				{ themes &&
					themes.map( ( theme, index ) => (
						<CollectionListItem
							key={ theme.id }
							collectionSlug={ collectionSlug }
							themeId={ theme.id }
						>
							{ children( collectionSlug, theme, index ) }
						</CollectionListItem>
					) ) }
			</ThemeCollection>
		</>
	);
}

export default memo( PartnerThemesCollection );
