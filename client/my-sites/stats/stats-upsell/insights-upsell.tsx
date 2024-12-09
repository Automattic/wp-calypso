import { useTranslate } from 'i18n-calypso';
import statsFeaturesPNG from 'calypso/assets/images/stats/paid-features-2.png';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { STATS_FEATURE_PAGE_INSIGHTS } from '../constants';
import StatsUpsell from './index';

const InsightsUpsell: React.FC = () => {
	const translate = useTranslate();

	return (
		<StatsUpsell
			statType={ STATS_FEATURE_PAGE_INSIGHTS }
			title={ translate( 'Unlock site insights' ) }
			features={ [
				translate( '{{personalFeaturesLink}}All personal plan features{{/personalFeaturesLink}}', {
					components: {
						personalFeaturesLink: (
							<InlineSupportLink supportContext="personal_plan" showIcon={ false } />
						),
					},
				} ),
				translate( 'Monitor your posting activity' ),
				translate( 'Track your all-time highlights and insights' ),
				translate( 'Keep your data private and GDPR-compliant' ),
				translate( '14-day money-back guarantee' ),
			] }
			image={ statsFeaturesPNG }
		/>
	);
};

export default InsightsUpsell;
