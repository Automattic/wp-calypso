import CustomerHomeLaunchpad from '.';

import './style.scss';

const checklistSlug = 'intent-build';

const LaunchpadIntentBuild = (): JSX.Element => {
	return (
		<>
			<CustomerHomeLaunchpad checklistSlug={ checklistSlug }></CustomerHomeLaunchpad>
		</>
	);
};

export default LaunchpadIntentBuild;
