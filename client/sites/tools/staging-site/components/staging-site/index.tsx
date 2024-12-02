import { FEATURE_SITE_STAGING_SITES } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StagingSiteCard from '../staging-site-card';
import StagingSiteProductionCard from '../staging-site-card/staging-site-production-card';
import StagingSiteUpsellNudge from '../staging-site-upsell-nudge';
import './style.scss';

const StagingSite = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) ?? 0;
	const features = useSelector( ( state ) => getSiteFeatures( state, siteId ) );
	const hasStagingSitesFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_SITE_STAGING_SITES )
	);
	const isWpcomStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );

	if ( ! features ) {
		return null;
	}

	if ( ! hasStagingSitesFeature ) {
		return <StagingSiteUpsellNudge />;
	}

	if ( isWpcomStagingSite ) {
		return <StagingSiteProductionCard siteId={ siteId } />;
	}

	return <StagingSiteCard />;
};

export default StagingSite;
