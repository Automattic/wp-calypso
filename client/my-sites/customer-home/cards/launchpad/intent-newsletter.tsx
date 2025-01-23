import CustomerHomeLaunchpad from '.';

const LaunchpadIntentNewsletter = ( { checklistSlug }: { checklistSlug: string } ): JSX.Element => {
	return (
		<>
			<CustomerHomeLaunchpad checklistSlug={ checklistSlug }></CustomerHomeLaunchpad>
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
