import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { ThemesQuery } from 'calypso/my-sites/themes/collections/use-theme-collection';
import AIBuilderBanner from '../banners-modern/ai-builder-banner';
import DIFMBanner from '../banners-modern/difm-banner';
import ThemeSection from './theme-section';

const FAVORITES_QUERY: ThemesQuery = {
	collection: 'recommended',
	number: 6,
	tier: '',
	filter: '',
	search: '',
	page: 1,
};

const FRESH_QUERY: ThemesQuery = {
	number: 6,
	tier: '',
	filter: '',
	search: '',
	page: 1,
	sort: 'date',
};

const PARTNER_QUERY: ThemesQuery = {
	collection: 'recommended',
	number: 6,
	tier: 'marketplace',
	filter: '',
	search: '',
	page: 1,
};

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
			<AIBuilderBanner />
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
			<DIFMBanner />
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
				variant="dark"
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
