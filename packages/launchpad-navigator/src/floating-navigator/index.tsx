import { Card } from '@automattic/components';
import { DefaultWiredLaunchpad } from '@automattic/launchpad';

import './style.scss';

export type FloatingNavigatorProps = {
	siteSlug: string | null;
};

const FloatingNavigator = ( { siteSlug }: FloatingNavigatorProps ) => {
	const launchpadContext = 'launchpad-navigator';
	const checklistSlug = 'intent-build';

	return (
		<Card className="launchpad-navigator__floating-navigator">
			<DefaultWiredLaunchpad
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				launchpadContext={ launchpadContext }
			/>
		</Card>
	);
};

export default FloatingNavigator;
