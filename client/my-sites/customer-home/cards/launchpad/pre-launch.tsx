import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { useUnifiedLaunchExperiment } from 'calypso/landing/stepper/hooks/use-unified-launch-experiment';
import { useDispatch, useSelector } from 'calypso/state';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CelebrateLaunchModal from '../../components/celebrate-launch-modal';
import { useCelebrateLaunchModal } from './use-celebrate-launch-modal';
import CustomerHomeLaunchpad from '.';
import type { AppState } from 'calypso/types';

type LaunchpadPreLaunchProps = {
	checklistSlug?: string;
};

const LaunchpadPreLaunch = ( props: LaunchpadPreLaunchProps ): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';
	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );
	const dispatch = useDispatch();

	const layout = useHomeLayoutQuery( siteId || null );
	const {
		isOpen,
		setModalIsOpen,
		handleSiteLaunched: handleSubmit,
	} = useCelebrateLaunchModal( siteId, layout );
	const [ isLoadingExperiment, experiment ] = useUnifiedLaunchExperiment();

	if ( isLoadingExperiment ) {
		return null;
	}

	const handleSiteLaunched = () => {
		dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId, 'home' ) );

		if ( experiment === null || experiment === 'ungated_site_launch' || experiment === 'control' ) {
			handleSubmit( !! site?.is_wpcom_atomic );
		}
	};

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ props.checklistSlug ?? checklistSlug }
				onSiteLaunched={ handleSiteLaunched }
			/>
			{ isOpen && (
				<CelebrateLaunchModal
					setModalIsOpen={ setModalIsOpen }
					site={ site }
					allDomains={ allDomains }
				/>
			) }
		</>
	);
};

export default LaunchpadPreLaunch;
