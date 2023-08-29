import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';
import type { AppState } from 'calypso/types';

const LaunchpadPreLaunch = (): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || '';
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';

	return <CustomerHomeLaunchpad checklistSlug={ checklistSlug }></CustomerHomeLaunchpad>;
};

export default LaunchpadPreLaunch;
