import LaunchpadPreLaunch from './pre-launch';
import type { JSX } from 'react';

export const LaunchpadPostMigration = (): JSX.Element => {
	const checklistSlug = 'post-migration';

	return <LaunchpadPreLaunch checklistSlug={ checklistSlug } />;
};
