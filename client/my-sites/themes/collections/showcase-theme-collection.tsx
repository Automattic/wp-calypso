import page from '@automattic/calypso-router';
import { ReactElement } from 'react';
import { useQueryThemes } from 'calypso/components/data/query-themes';
import ThemeCollection from 'calypso/components/theme-collection';
import ThemeCollectionItem from 'calypso/components/theme-collection/theme-collection-item';
import ThemeCollectionPlaceholder from 'calypso/components/theme-collection/theme-collection-placeholder';
import { ThemeBlock } from 'calypso/components/themes-list';
import { getThemeShowcaseEventRecorder } from 'calypso/my-sites/themes/events/theme-showcase-tracks';
import { trackClick } from 'calypso/my-sites/themes/helpers';
import { useSelector } from 'calypso/state';
import {
	getThemesForQueryIgnoringPage,
	prependThemeFilterKeys,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Theme } from 'calypso/types';
import './style.scss';

export interface ThemesQuery {
	page: number;
	number: number;
	tier: string;
	filter: string;
	search: string;
	collection: string;
}

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
	const siteId = useSelector( getSelectedSiteId );

	const themes =
		useSelector( ( state ) => getThemesForQueryIgnoringPage( state, 'wpcom', query ) ) || [];

	const filterString = useSelector( ( state ) => prependThemeFilterKeys( state, query.filter ) );

	useQueryThemes( 'wpcom', query );

	const { recordThemeClick, recordThemeStyleVariationClick, recordThemesStyleVariationMoreClick } =
		getThemeShowcaseEventRecorder( query, themes, filterString, collectionSlug, collectionIndex );

	const onScreenshotClick = (
		themeId: string,
		resultsRank: number,
		isActive: boolean,
		themeType: string,
		themeTier: string
	) => {
		trackClick( 'theme', 'screenshot' );
		recordThemeClick( themeId, resultsRank, isActive, themeType, themeTier, 'screenshot_info' );
	};

	const onStyleVariationClick = (
		themeId: string,
		resultsRank: number,
		variation: { slug: string },
		isActive: boolean,
		themeType: string,
		themeTier: string,
		themeDetailsUrl: string
	) => {
		recordThemeClick(
			themeId,
			resultsRank,
			isActive,
			themeType,
			themeTier,
			'style_variation',
			variation?.slug
		);

		if ( variation ) {
			recordThemeStyleVariationClick(
				themeId,
				resultsRank,
				isActive,
				themeType,
				themeTier,
				'',
				variation.slug
			);
		} else {
			recordThemesStyleVariationMoreClick( themeId, resultsRank, isActive, themeType, themeTier );
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
								getScreenshotUrl={ getScreenshotUrl }
								index={ index }
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
