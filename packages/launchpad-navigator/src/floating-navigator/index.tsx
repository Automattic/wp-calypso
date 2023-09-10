import { Card } from '@automattic/components';
import { Launchpad } from '@automattic/launchpad';

import './style.scss';

export type FloatingNavigatorProps = {
	siteSlug: string | null;
};

const FloatingNavigator = ( { siteSlug }: FloatingNavigatorProps ) => {
	return (
		<Card className="launchpad-navigator__floating-navigator">
			<Launchpad siteSlug={ siteSlug } checklistSlug="intent-build" />
		</Card>
	);
};

export default FloatingNavigator;
