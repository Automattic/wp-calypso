import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
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
import './style.scss';

const FAVORITES_QUERY: ThemesQuery = {
	collection: 'recommended',
	number: 6,
	tier: '',
	filter: '',
	search: '',
	page: 1,
};

const FRESH_QUERY: ThemesQuery = {
	collection: '',
	number: 6,
	tier: '',
	filter: '',
	search: '',
	page: 1,
};

const PARTNER_QUERY: ThemesQuery = {
	collection: 'recommended',
	number: 6,
	tier: 'marketplace',
	filter: '',
	search: '',
	page: 1,
};

type ThemeSectionProps = {
	title: string;
	subtitle: TranslateResult;
	buttonLabel: string;
	seeAllUrl: string;
	query: ThemesQuery;
	sectionSlug: string;
	sectionIndex: number;
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
};

function ThemeSection( {
	title,
	subtitle,
	buttonLabel,
	seeAllUrl,
	query,
	sectionSlug,
	sectionIndex,
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
		<div className="theme-section-modern">
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

type RecommendedSectionsProps = {
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
};

export default function RecommendedSections( {
	getActionLabel,
	getOptions,
	getScreenshotUrl,
}: RecommendedSectionsProps ) {
	const translate = useTranslate();

	return (
		<div className="recommended-sections">
			<ThemeSection
				title={ translate( 'Our favorites' ) }
				subtitle={ translate( 'Exceptional themes selected by the WordPress.com design team.' ) }
				buttonLabel={ translate( 'See all' ) }
				seeAllUrl="/themes/recommended/collection"
				query={ FAVORITES_QUERY }
				sectionSlug="favorites"
				sectionIndex={ 0 }
				getActionLabel={ getActionLabel }
				getOptions={ getOptions }
				getScreenshotUrl={ getScreenshotUrl }
			/>
			<ThemeSection
				title={ translate( 'Fresh themes' ) }
				subtitle={ translate( 'All the latest themes from WordPress.com designers.' ) }
				buttonLabel={ translate( 'See all' ) }
				seeAllUrl="/themes/all"
				query={ FRESH_QUERY }
				sectionSlug="fresh"
				sectionIndex={ 1 }
				getActionLabel={ getActionLabel }
				getOptions={ getOptions }
				getScreenshotUrl={ getScreenshotUrl }
			/>
			<ThemeSection
				title={ translate( 'Partner themes' ) }
				subtitle={
					<>
						{ translate( 'Level up your site with exclusive themes from expert partners.' ) }
						<br />
						{ translate( 'Available on %(planName)s plans with an additional theme subscription.', {
							args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
						} ) }
					</>
				}
				buttonLabel={ translate( 'See all' ) }
				seeAllUrl="/themes/partner"
				query={ PARTNER_QUERY }
				sectionSlug="partner"
				sectionIndex={ 2 }
				getActionLabel={ getActionLabel }
				getOptions={ getOptions }
				getScreenshotUrl={ getScreenshotUrl }
			/>
		</div>
	);
}
