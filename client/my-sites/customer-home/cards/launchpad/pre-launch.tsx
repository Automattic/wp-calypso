import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { useSelector } from 'calypso/state';
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

	const layout = useHomeLayoutQuery( siteId || null );
	const { isOpen, setModalIsOpen, handleSiteLaunched } = useCelebrateLaunchModal( siteId, layout );

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ props.checklistSlug ?? checklistSlug }
				onSiteLaunched={ () => handleSiteLaunched( !! site?.is_wpcom_atomic ) }
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
