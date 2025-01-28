import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CelebrateLaunchModal from '../../components/celebrate-launch-modal';
import { useCelebrateLaunchModal } from './use-celebrate-launch-modal';
import CustomerHomeLaunchpad from '.';
import type { AppState } from 'calypso/types';

const LaunchpadIntentNewsletter = ( { checklistSlug }: { checklistSlug: string } ): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const layoutQuery = useHomeLayoutQuery( siteId || null );
	const { isOpen, setModalIsOpen, handleSiteLaunched } = useCelebrateLaunchModal(
		siteId,
		layoutQuery
	);

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ checklistSlug }
				onSiteLaunched={ () => handleSiteLaunched( !! site?.is_wpcom_atomic ) }
			></CustomerHomeLaunchpad>
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

export const LaunchpadIntentFreeNewsletter = (): JSX.Element => {
	return <LaunchpadIntentNewsletter checklistSlug="intent-free-newsletter" />;
};

export const LaunchpadIntentPaidNewsletter = (): JSX.Element => {
	return <LaunchpadIntentNewsletter checklistSlug="intent-paid-newsletter" />;
};

export const LaunchpadIntentNewsletterGoal = (): JSX.Element => {
	return <LaunchpadIntentNewsletter checklistSlug="intent-newsletter-goal" />;
};
