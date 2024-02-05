import page from '@automattic/calypso-router';
import { ReactElement } from 'react';
import { useQueryThemes } from 'calypso/components/data/query-themes';
import ThemeCollection from 'calypso/components/theme-collection';
import ThemeCollectionItem from 'calypso/components/theme-collection/theme-collection-item';
import ThemeCollectionPlaceholder from 'calypso/components/theme-collection/theme-collection-placeholder';
import { ThemeBlock } from 'calypso/components/themes-list';
import {
	ThemesQuery,
	useThemeCollection,
} from 'calypso/my-sites/themes/collections/use-theme-collection';
import { getThemeShowcaseEventRecorder } from 'calypso/my-sites/themes/events/theme-showcase-tracks';
import { trackClick } from 'calypso/my-sites/themes/helpers';
import { Theme } from 'calypso/types';
import './style.scss';

type ShowcaseThemeCollectionProps = {
	collectionSlug: string;
	title: string;
	description: string | null;
	query: ThemesQuery;
	onSeeAll: () => void;
	collectionIndex: number;
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
};

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
	const {
		getPrice,
		themes,
		isActive,
		isInstalling,
		isLivePreviewStarted,
		siteId,
		getThemeType,
		getThemeTierForTheme,
		filterString,
		getThemeDetailsUrl,
	} = useThemeCollection( query );
	useQueryThemes( 'wpcom', query );

	const { recordThemeClick, recordThemeStyleVariationClick, recordThemesStyleVariationMoreClick } =
		getThemeShowcaseEventRecorder(
			query,
			themes,
			filterString,
			getThemeType,
			getThemeTierForTheme,
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

		if ( variation ) {
			recordThemeStyleVariationClick( themeId, resultsRank, '', variation.slug );
		} else {
			recordThemesStyleVariationMoreClick( themeId, resultsRank );
			const themeDetailsUrl = getThemeDetailsUrl( themeId );
			themeDetailsUrl && page( themeDetailsUrl );
		}
	};

	return (
		<>
			<ThemeCollection
				collectionSlug={ collectionSlug }
				title={ title }
				description={ description }
				onSeeAll={ onSeeAll }
				collectionIndex={ collectionIndex }
			>
				{ themes.length > 0 ? (
					themes.map( ( theme: Theme, index: number ) => (
						<ThemeCollectionItem key={ theme.id }>
							<ThemeBlock
								getActionLabel={ getActionLabel }
								getButtonOptions={ getOptions }
								getPrice={ getPrice }
								getScreenshotUrl={ getScreenshotUrl }
								index={ index }
								isActive={ isActive }
								isInstalling={ isInstalling }
								isLivePreviewStarted={ isLivePreviewStarted }
								siteId={ siteId }
								theme={ theme }
								onMoreButtonClick={ recordThemeClick }
								onMoreButtonItemClick={ recordThemeClick }
								onScreenshotClick={ onScreenshotClick }
								onStyleVariationClick={ onStyleVariationClick }
							/>
						</ThemeCollectionItem>
					) )
				) : (
					<ThemeCollectionPlaceholder items={ 3 } />
				) }
			</ThemeCollection>
		</>
	);
}
