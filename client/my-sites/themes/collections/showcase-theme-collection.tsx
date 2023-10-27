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
import { getThemeShowcaseEventRecorder } from 'calypso/my-sites/themes/events/theme-showcase-tracks';
import { trackClick } from 'calypso/my-sites/themes/helpers';

interface ShowcaseThemeCollectionProps extends ThemeCollectionsLayoutProps {
	collectionSlug: string;
	title: string;
	description: ReactElement | null;
	query: ThemesQuery;
	onSeeAll: () => void;
	collectionIndex: number;
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
	collectionIndex,
}: ShowcaseThemeCollectionProps ): ReactElement {
	const { getPrice, themes, isActive, isInstalling, siteId, getThemeType, filterString } =
		useThemeCollection( query );
	let themeList = getCachedThemes( collectionSlug );

	if ( ! themeList.length && themes ) {
		cacheThemes( collectionSlug, themes );
		themeList = getCachedThemes( collectionSlug );
	}

	const { recordThemeClick, recordThemeStyleVariationClick, recordThemesStyleVariationMoreClick } =
		getThemeShowcaseEventRecorder(
			query,
			themes,
			filterString,
			getThemeType,
			isActive,
			collectionSlug,
			collectionIndex
		);

	const onScreenshotClick = ( themeId: string, resultsRank: number ) => {
		trackClick( 'theme', 'screenshot' );
		recordThemeClick( themeId, resultsRank, 'screenshot_info' );
	};

	const onStyleVariationClick = (
		themeId: string,
		resultsRank: number,
		variation: { slug: string }
	) => {
		recordThemeClick( themeId, resultsRank, 'style_variation', variation?.slug );
		variation
			? recordThemeStyleVariationClick( themeId, resultsRank, '', variation.slug )
			: recordThemesStyleVariationMoreClick( themeId, resultsRank );
	};

	return (
		<>
			<QueryThemes query={ query } siteId="wpcom" />
			<ThemeCollection
				collectionSlug={ collectionSlug }
				title={ title }
				description={ description }
				onSeeAll={ onSeeAll }
				collectionIndex={ collectionIndex }
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
							onMoreButtonClick={ recordThemeClick }
							onMoreButtonItemClick={ recordThemeClick }
							onScreenshotClick={ onScreenshotClick }
							onStyleVariationClick={ onStyleVariationClick }
						/>
					</ThemeCollectionItem>
				) ) }
			</ThemeCollection>
		</>
	);
}
