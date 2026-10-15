import CustomerHomeLaunchpad from '.';
import type { JSX } from 'react';

export const LaunchpadIntentFreeNewsletter = (): JSX.Element => {
	return <CustomerHomeLaunchpad checklistSlug="intent-free-newsletter" />;
};

export const LaunchpadIntentPaidNewsletter = (): JSX.Element => {
	return <CustomerHomeLaunchpad checklistSlug="intent-paid-newsletter" />;
};

export const LaunchpadIntentNewsletterGoal = (): JSX.Element => {
	return <CustomerHomeLaunchpad checklistSlug="intent-newsletter-goal" />;
};
