import CustomerHomeLaunchpad from '.';

const checklistSlug = 'host-site';

const LaunchpadIntentHosting = (): JSX.Element => {
	return (
		<>
			<CustomerHomeLaunchpad checklistSlug={ checklistSlug }></CustomerHomeLaunchpad>
		</>
	);
};

export default LaunchpadIntentHosting;
