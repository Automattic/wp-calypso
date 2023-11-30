import LaunchpadPreLaunch from './pre-launch';

const LaunchpadSiteSetup = (): JSX.Element => {
	const checklistSlug = 'legacy-site-setup';

	return (
		<>
			<LaunchpadPreLaunch checklistSlug={ checklistSlug } />
		</>
	);
};

export default LaunchpadSiteSetup;
