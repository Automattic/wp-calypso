import { useTranslate } from 'i18n-calypso';
import statsFeaturesPNG from 'calypso/assets/images/stats/paid-features.png';
import { STATS_FEATURE_PAGE_TRAFFIC } from '../constants';
import StatsUpsell from './index';

const TrafficUpsell: React.FC = () => {
	const translate = useTranslate();

	return (
		<StatsUpsell
			statType={ STATS_FEATURE_PAGE_TRAFFIC }
			title={ translate( 'Unlock site growth analytics' ) }
			features={ [
				translate( 'View trends and data from any time period' ),
				translate( 'Understand how visitors find and use your site' ),
				translate( 'Track which posts and pages are most popular' ),
				translate( 'See where your visitors come from worldwide' ),
				translate( 'Discover which links generate most clicks' ),
				translate( 'Monitor email engagement and downloads' ),
				translate( 'Keep your data private and GDPR-compliant' ),
			] }
			image={ statsFeaturesPNG }
		/>
	);
};

export default TrafficUpsell;
