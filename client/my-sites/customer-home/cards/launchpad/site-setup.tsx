import LaunchpadPreLaunch from './pre-launch';
import type { JSX } from 'react';

export const LaunchpadSiteSetup = (): JSX.Element => {
	const checklistSlug = 'legacy-site-setup';

	return (
		<>
			<LaunchpadPreLaunch checklistSlug={ checklistSlug } />
		</>
	);
};
