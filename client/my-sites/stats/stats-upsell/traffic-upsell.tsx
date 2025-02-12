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
				translate( 'Detailed stats about posts, referrers, clicks and more' ),
				translate( 'Keep your data private and GDPR-compliant' ),
				translate( '14-day money-back guarantee' ),
				translate( '6 GB storage' ),
				translate( 'Unlimited pages, posts, users, and visitors' ),
				translate( 'Free domain for one year' ),
				translate( 'Ad-free browsing experience for your visitors' ),
				translate( 'Dozens of premium themes' ),
				translate( 'Fast support from our expert team' ),
				translate( 'Customize fonts and colors sitewide' ),
			] }
			image={ statsFeaturesPNG }
			expandableView
			mainFeatureLimit={ 4 }
			expandText={ translate( 'Show all Personal features' ) }
		/>
	);
};

export default TrafficUpsell;
