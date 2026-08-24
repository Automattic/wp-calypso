import CustomerHomeLaunchpad from '.';
import type { JSX } from 'react';

const checklistSlug = 'intent-write';

const LaunchpadIntentWrite = (): JSX.Element => {
	return <CustomerHomeLaunchpad checklistSlug={ checklistSlug }></CustomerHomeLaunchpad>;
};

export default LaunchpadIntentWrite;
