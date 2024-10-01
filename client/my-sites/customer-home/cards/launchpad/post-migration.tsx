import LaunchpadPreLaunch from './pre-launch';

export const LaunchpadPostMigration = (): JSX.Element => {
	const checklistSlug = 'post-migration';

	return <LaunchpadPreLaunch checklistSlug={ checklistSlug } />
		<>
			<LaunchpadPreLaunch checklistSlug={ checklistSlug } />
		</>
	);
};
