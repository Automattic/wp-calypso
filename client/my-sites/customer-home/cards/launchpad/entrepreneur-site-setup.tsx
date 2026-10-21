import CustomerHomeLaunchpad from '.';
import type { JSX } from 'react';

const checklistSlug = 'entrepreneur-site-setup';

const LaunchpadEntrepreneurSiteSetup = (): JSX.Element => {
	return <CustomerHomeLaunchpad checklistSlug={ checklistSlug }></CustomerHomeLaunchpad>;
};

export default LaunchpadEntrepreneurSiteSetup;
