import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import statsFeaturesPNG from 'calypso/assets/images/stats/paid-features.png';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { WPCOM_PERSONAL_PLAN_SUPPORT } from '../const';
import { STATS_FEATURE_PAGE_TRAFFIC } from '../constants';
import StatsUpsell from './index';

const TrafficUpsell: React.FC = () => {
	const translate = useTranslate();
	const isOdysseyStats = isEnabled( 'is_odyssey' );

	return (
		<StatsUpsell
			statType={ STATS_FEATURE_PAGE_TRAFFIC }
			title={ translate( 'Unlock site growth analytics' ) }
			features={ [
				translate( '{{personalFeaturesLink}}All personal plan features{{/personalFeaturesLink}}', {
					components: {
						personalFeaturesLink: ! isOdysseyStats ? (
							<InlineSupportLink supportContext="personal_plan" showIcon={ false } />
						) : (
							<Button
								href={ localizeUrl( WPCOM_PERSONAL_PLAN_SUPPORT ) }
								target="_blank"
								rel="norefferer"
								variant="link"
							/>
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
