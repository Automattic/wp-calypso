import StagingSiteCard from 'calypso/my-sites/hosting/staging-site-card';
import StagingSiteProductionCard from 'calypso/my-sites/hosting/staging-site-card/staging-site-production-card';
import { useSelector } from 'calypso/state';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

const StagingSite = () => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) ) ?? 0;
	const isWpcomStagingSite = useSelector( ( state ) =>
		isSiteWpcomStaging( state, selectedSiteId )
	);

	if ( isWpcomStagingSite ) {
		return <StagingSiteProductionCard siteId={ selectedSiteId } isBorderless />;
	}

	return <StagingSiteCard isBorderless />;
};

export default StagingSite;
