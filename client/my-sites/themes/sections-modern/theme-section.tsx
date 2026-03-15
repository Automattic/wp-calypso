import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { useQueryThemes } from 'calypso/components/data/query-themes';
import { ThemeBlock } from 'calypso/components/themes-list';
import {
	ThemesQuery,
	useThemeCollection,
} from 'calypso/my-sites/themes/collections/use-theme-collection';
import { getThemeShowcaseEventRecorder } from 'calypso/my-sites/themes/events/theme-showcase-tracks';
import { trackClick } from 'calypso/my-sites/themes/helpers';
import { Theme } from 'calypso/types';
import ThemeSectionHeader from './theme-section-header';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

export type ThemeSectionProps = {
	title: string;
	subtitle: TranslateResult;
	buttonLabel: string;
	seeAllUrl: string;
	query: ThemesQuery;
	sectionSlug: string;
	sectionIndex: number;
	variant?: 'light' | 'dark';
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
};

export default function ThemeSection( {
	title,
	subtitle,
	buttonLabel,
	seeAllUrl,
	query,
	sectionSlug,
	sectionIndex,
	variant = 'light',
	getActionLabel,
	getOptions,
	getScreenshotUrl,
}: ThemeSectionProps ) {
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
			sectionSlug,
			sectionIndex
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
			if ( themeDetailsUrl ) {
				page( themeDetailsUrl );
			}
		}
	};

	const handleSeeAll = () => {
		page( seeAllUrl );
		window.scrollTo( { top: 0 } );
	};

	return (
		<div className={ clsx( 'theme-section-modern', { 'is-dark': variant === 'dark' } ) }>
			<ThemeSectionHeader
				title={ title }
				subtitle={ subtitle }
				buttonLabel={ buttonLabel }
				onButtonClick={ handleSeeAll }
			/>
			<div className="theme-section-modern__grid">
				{ themes.map( ( theme: Theme, index: number ) => (
					<ThemeBlock
						key={ theme.id }
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
				) ) }
			</div>
		</div>
	);
}
