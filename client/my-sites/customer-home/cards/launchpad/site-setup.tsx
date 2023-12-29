import LaunchpadPreLaunch from './pre-launch';

export const LaunchpadSiteSetup = (): JSX.Element => {
	const checklistSlug = 'legacy-site-setup';

	return (
		<>
			<LaunchpadPreLaunch checklistSlug={ checklistSlug } />
		</>
	);
};
