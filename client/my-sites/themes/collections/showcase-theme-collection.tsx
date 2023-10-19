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

	return (
		<>
			<QueryThemes query={ query } siteId="wpcom" />
			<ThemeCollection
				collectionSlug={ collectionSlug }
				title={ title }
				description={ description }
				onSeeAll={ onSeeAll }
			>
				{ themes &&
					themes.map( ( theme, index ) => (
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
