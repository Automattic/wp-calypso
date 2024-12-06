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
				translate( 'Overview yearly data' ),
				translate( 'Learn from your all-time posting highlights' ),
				translate( 'Monitor your posting activity' ),
				translate( 'Visualize your all-time traffic insights' ),
				translate( 'Track your tags and category traffic' ),
				translate( 'Keep your data private and GDPR-compliant' ),
			] }
			image={ statsFeaturesPNG }
		/>
	);
};

export default InsightsUpsell;
