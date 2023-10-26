import config from '@automattic/calypso-config';
import { ReactElement } from 'react';
import QueryThemes from 'calypso/components/data/query-themes';
import ThemeCollection from 'calypso/components/theme-collection';
import ThemeCollectionItem from 'calypso/components/theme-collection/theme-collection-item';
import { ThemeBlock } from 'calypso/components/themes-list';
import { ThemeCollectionsLayoutProps } from 'calypso/my-sites/themes/collections/theme-collections-layout';
import {
	ThemesQuery,
	useThemeCollection,
} from 'calypso/my-sites/themes/collections/use-theme-collection';

interface ShowcaseThemeCollectionProps extends ThemeCollectionsLayoutProps {
	collectionSlug: string;
	title: string;
	description: ReactElement | null;
	query: ThemesQuery;
	onSeeAll: () => void;
}

type Theme = {
	id: string;
};

const sortedThemes: Map< string, Array< Theme > > = new Map();

const cacheThemes = ( collectionSlug: string, themes: Array< Theme > ) => {
	sortedThemes.set(
		collectionSlug,
		config.isEnabled( 'themes/discovery-randomize-collection-themes' )
			? themes.sort( () => Math.random() - 0.5 )
			: themes
	);
};

const getCachedThemes = ( collectionSlug: string ): Array< Theme > =>
	sortedThemes.get( collectionSlug ) ?? [];

export default function ShowcaseThemeCollection( {
	collectionSlug,
	description,
	getActionLabel,
	getOptions,
	getScreenshotUrl,
	query,
	title,
	onSeeAll,
}: ShowcaseThemeCollectionProps ): ReactElement {
	const { getPrice, themes, isActive, isInstalling, siteId } = useThemeCollection( query );
	const themeList = getCachedThemes( collectionSlug );

	if ( ! themeList.length && themes ) {
		cacheThemes( collectionSlug, themes );
	}

	return (
		<>
			<QueryThemes query={ query } siteId="wpcom" />
			<ThemeCollection
				collectionSlug={ collectionSlug }
				title={ title }
				description={ description }
				onSeeAll={ onSeeAll }
			>
				{ themeList.map( ( theme: Theme, index: number ) => (
					<ThemeCollectionItem key={ theme.id }>
						<ThemeBlock
							getActionLabel={ getActionLabel }
							getButtonOptions={ getOptions }
							getPrice={ getPrice }
							getScreenshotUrl={ getScreenshotUrl }
							index={ index }
							isActive={ isActive }
							isInstalling={ isInstalling }
							siteId={ siteId }
							theme={ theme }
						/>
					</ThemeCollectionItem>
				) ) }
			</ThemeCollection>
		</>
	);
}
