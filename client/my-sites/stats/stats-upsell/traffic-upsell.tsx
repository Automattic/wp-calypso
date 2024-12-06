import { useTranslate } from 'i18n-calypso';
import statsFeaturesPNG from 'calypso/assets/images/stats/paid-features.png';
import StatsUpsell from './index';

interface Props {
	siteId: number;
}

const TrafficUpsell: React.FC< Props > = ( { siteId } ) => {
	const translate = useTranslate();

	return (
		<StatsUpsell
			siteId={ siteId }
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
