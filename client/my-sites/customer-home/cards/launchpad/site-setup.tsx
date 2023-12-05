import LaunchpadPreLaunch from './pre-launch';

export const LaunchpadSiteSetup = (): JSX.Element => {
	const checklistSlug = 'legacy-site-setup';

	return (
		<>
			<LaunchpadPreLaunch checklistSlug={ checklistSlug } />
		</>
	);
};

export const LaunchpadSiteSetupHosted = (): JSX.Element => {
	const checklistSlug = 'hosted-site-setup';

	return (
		<>
			<LaunchpadPreLaunch checklistSlug={ checklistSlug } />
		</>
	);
};

export const LaunchpadSiteSetupWrite = (): JSX.Element => {
	const checklistSlug = 'write-site-setup';

	return (
		<>
			<LaunchpadPreLaunch checklistSlug={ checklistSlug } />
		</>
	);
};
