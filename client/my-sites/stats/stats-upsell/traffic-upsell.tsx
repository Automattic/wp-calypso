import { useTranslate } from 'i18n-calypso';
import statsFeaturesPNG from 'calypso/assets/images/stats/paid-features.png';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { STATS_FEATURE_PAGE_TRAFFIC } from '../constants';
import StatsUpsell from './index';

const TrafficUpsell: React.FC = () => {
	const translate = useTranslate();

	return (
		<StatsUpsell
			statType={ STATS_FEATURE_PAGE_TRAFFIC }
			title={ translate( 'Unlock site growth analytics' ) }
			features={ [
				translate( '{{personalFeaturesLink}}All personal plan features{{/personalFeaturesLink}}', {
					components: {
						personalFeaturesLink: (
							<InlineSupportLink supportContext="personal_plan" showIcon={ false } />
						),
					},
				} ),
				translate( 'View trends and data from any time period' ),
				translate( 'Detailed stats about posts, referrers, clicks and more' ),
				translate( 'Keep your data private and GDPR-compliant' ),
				translate( '14-day money-back guarantee' ),
			] }
			image={ statsFeaturesPNG }
		/>
	);
};

export default TrafficUpsell;
