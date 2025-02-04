import CustomerHomeLaunchpad from '.';

const checklistSlug = 'intent-build';

const LaunchpadIntentBuild = (): JSX.Element => {
	return (
		<>
			<CustomerHomeLaunchpad checklistSlug={ checklistSlug }></CustomerHomeLaunchpad>
		</>
	);
};

export default LaunchpadIntentBuild;
