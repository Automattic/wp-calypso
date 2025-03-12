import {
	isGlobalStylesOnPersonalEnabled,
	getFeature,
	FEATURE_UNLIMITED_ENTITIES,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_AD_FREE_EXPERIENCE,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
	FEATURE_SUPPORT_FROM_EXPERTS,
	FEATURE_STYLE_CUSTOMIZATION,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import statsFeaturesPNG from 'calypso/assets/images/stats/paid-features-2.png';
import { STATS_FEATURE_PAGE_INSIGHTS } from '../constants';
import StatsUpsell from './index';

const InsightsUpsell: React.FC = () => {
	const translate = useTranslate();

	return (
		<StatsUpsell
			statType={ STATS_FEATURE_PAGE_INSIGHTS }
			title={ translate( 'Unlock site insights' ) }
			features={ [
				translate( 'Monitor your posting activity' ),
				translate( 'Track your all-time highlights and insights' ),
				translate( 'Keep your data private and GDPR-compliant' ),
				translate( '14-day money-back guarantee' ),
				translate( '6 GB storage' ),
				getFeature( FEATURE_UNLIMITED_ENTITIES ).getTitle(),
				getFeature( FEATURE_CUSTOM_DOMAIN ).getTitle(),
				getFeature( FEATURE_AD_FREE_EXPERIENCE ).getTitle(),
				getFeature( WPCOM_FEATURES_PREMIUM_THEMES_LIMITED ).getTitle(),
				getFeature( FEATURE_SUPPORT_FROM_EXPERTS ).getTitle(),
				...( isGlobalStylesOnPersonalEnabled()
					? [ getFeature( FEATURE_STYLE_CUSTOMIZATION ).getTitle() ]
					: [] ),
			] }
			image={ statsFeaturesPNG }
			expandableView
			mainFeatureLimit={ 4 }
			expandText={ translate( 'Show all Personal features' ) }
		/>
	);
};

export default InsightsUpsell;
