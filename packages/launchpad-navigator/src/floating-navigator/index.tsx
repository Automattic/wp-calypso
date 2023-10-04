import { Card, Button } from '@automattic/components';
import { LaunchpadNavigator } from '@automattic/data-stores';
import { DefaultWiredLaunchpad } from '@automattic/launchpad';
import { select } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export type FloatingNavigatorProps = {
	siteSlug: string | null;
};

const FloatingNavigator = ( { siteSlug }: FloatingNavigatorProps ) => {
	const launchpadContext = 'launchpad-navigator';
	const translate = useTranslate();
	const checklistSlug = select( LaunchpadNavigator.store ).getActiveChecklistSlug() || null;

	if ( ! checklistSlug ) {
		return null;
	}

	return (
		<Card className="launchpad-navigator__floating-navigator">
			<h2>{ translate( 'Next steps for your site' ) }</h2>
			<DefaultWiredLaunchpad
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				launchpadContext={ launchpadContext }
			/>
			<div className="launchpad-navigator__floating-navigator-actions">
				<Button disabled>{ translate( 'Older tasks' ) }</Button>
			</div>
		</Card>
	);
};

export default FloatingNavigator;
