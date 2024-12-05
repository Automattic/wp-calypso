import { useTranslate } from 'i18n-calypso';
import statsFeaturesPNG from 'calypso/assets/images/stats/paid-features-2.png';
import StatsUpsell from './index';

interface Props {
	siteId: number;
}

const InsightsUpsell: React.FC< Props > = ( { siteId } ) => {
	const translate = useTranslate();

	return (
		<StatsUpsell
			siteId={ siteId }
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
