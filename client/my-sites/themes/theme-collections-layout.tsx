import { memo, ReactElement } from 'react';
import QueryThemes from 'calypso/components/data/query-themes';
import ThemeCollection from 'calypso/components/theme-collection';
import ThemeCollectionItem from 'calypso/components/theme-collection/theme-collection-item';
import { ThemeBlock } from 'calypso/components/themes-list';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collection-definitions';
import { ThemesQuery, useThemeCollection } from 'calypso/my-sites/themes/use-theme-collection';

interface ThemesCollectionsLayoutProps {
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
}

function ThemeCollectionsLayout( {
	getActionLabel,
	getOptions,
	getScreenshotUrl,
}: ThemesCollectionsLayoutProps ) {
	const ShowcaseThemeCollection = ( {
		collectionSlug,
		title,
		description,
		query,
	}: {
		collectionSlug: string;
		title: string;
		description: ReactElement;
		query: ThemesQuery;
	} ): ReactElement => {
		const { getPrice, themes, isActive, isInstalling, siteId } = useThemeCollection( query );

		return (
			<>
				<QueryThemes query={ query } siteId="wpcom" />
				<ThemeCollection
					collectionSlug={ collectionSlug }
					title={ title }
					description={ description }
				>
					{ themes &&
						themes.map( ( theme, index ) => (
							<ThemeCollectionItem key={ theme.id }>
								<ThemeBlock
									collectionSlug={ collectionSlug }
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
	};

	return (
		<>
			<ShowcaseThemeCollection
				key={ THEME_COLLECTIONS.premium.collectionSlug }
				{ ...THEME_COLLECTIONS.premium }
			/>
			<ShowcaseThemeCollection
				key={ THEME_COLLECTIONS.partner.collectionSlug }
				{ ...THEME_COLLECTIONS.partner }
			/>
		</>
	);
}

export default memo( ThemeCollectionsLayout );
