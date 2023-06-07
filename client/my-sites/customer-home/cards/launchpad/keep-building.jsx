import { Launchpad } from '@automattic/launchpad';
import { connect } from 'react-redux';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const LaunchpadKeepBuilding = ( { siteSlug } ) => {
	return <Launchpad siteSlug={ siteSlug } checklistSlug="keep-building" />;
};

const ConnectedLaunchpadKeepBuilding = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( LaunchpadKeepBuilding );

export default ConnectedLaunchpadKeepBuilding;
