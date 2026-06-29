import { useCelebrateLaunchModalSideEffects } from 'calypso/my-sites/customer-home/celebrate-site-launch-modal/use-side-effects';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';
import type { AppState } from 'calypso/types';
import type { JSX } from 'react';

const LaunchpadIntentNewsletter = ( { checklistSlug }: { checklistSlug: string } ): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );

	const { onSiteLaunched } = useCelebrateLaunchModalSideEffects( siteId );

	return (
		<CustomerHomeLaunchpad
			checklistSlug={ checklistSlug }
			onSiteLaunched={ () => onSiteLaunched( !! site?.is_wpcom_atomic ) }
		/>
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
