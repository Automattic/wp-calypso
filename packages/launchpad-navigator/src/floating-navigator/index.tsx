import { Card } from '@automattic/components';
import { LaunchpadNavigator } from '@automattic/data-stores';
import { DefaultWiredLaunchpad } from '@automattic/launchpad';
import { select } from '@wordpress/data';

import './style.scss';

export type FloatingNavigatorProps = {
	siteSlug: string | null;
};

const FloatingNavigator = ( { siteSlug }: FloatingNavigatorProps ) => {
	const launchpadContext = 'launchpad-navigator';
	const checklistSlug = select( LaunchpadNavigator.store ).getActiveChecklistSlug() || null;

	if ( ! checklistSlug ) {
		return null;
	}

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
