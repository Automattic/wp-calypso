import { useDispatch, useSelector } from 'calypso/state';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';
import type { AppState } from 'calypso/types';

type LaunchpadPreLaunchProps = {
	checklistSlug?: string;
};

const LaunchpadPreLaunch = ( props: LaunchpadPreLaunchProps ): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';
	const dispatch = useDispatch();

	const handleSiteLaunched = () => {
		dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId, 'home' ) );
	};

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ props.checklistSlug ?? checklistSlug }
				onSiteLaunched={ handleSiteLaunched }
			/>
		</>
	);
};

export default LaunchpadPreLaunch;
