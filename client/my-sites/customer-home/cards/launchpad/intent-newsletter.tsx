import { useSelector, useDispatch } from 'calypso/state';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';

const LaunchpadIntentNewsletter = ( { checklistSlug }: { checklistSlug: string } ): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const dispatch = useDispatch();

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ checklistSlug }
				onSiteLaunched={ () => {
					dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId, 'home' ) );
				} }
			/>
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
