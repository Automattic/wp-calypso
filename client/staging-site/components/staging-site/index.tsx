import { FEATURE_SITE_STAGING_SITES, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import StagingSiteCard from 'calypso/my-sites/hosting/staging-site-card';
import StagingSiteProductionCard from 'calypso/my-sites/hosting/staging-site-card/staging-site-production-card';
import { useSelector } from 'calypso/state';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StagingSiteUpsellNudge from '../staging-site-upsell-nudge';
import './style.scss';

const StagingSite = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) ?? 0;
	const hasAtomicFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC )
	);
	const hasStagingSitesFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_SITE_STAGING_SITES )
	);
	const isWpcomStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );

	if ( ! hasAtomicFeature || ! hasStagingSitesFeature ) {
		return <StagingSiteUpsellNudge />;
	}

	if ( isWpcomStagingSite ) {
		return <StagingSiteProductionCard siteId={ siteId } isBorderless />;
	}

	return <StagingSiteCard isBorderless />;
};

export default StagingSite;
