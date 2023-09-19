import { Card } from '@automattic/components';
import { LaunchpadNavigator } from '@automattic/data-stores';
import { Launchpad } from '@automattic/launchpad';
import { select } from '@wordpress/data';
import { useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useLaunchpadNavigator } from 'calypso/data/launchpad-navigator/use-launchpad-navigator';
import type { Dispatch } from 'react';

import './style.scss';

export type FloatingNavigatorProps = {
	siteSlug: string;
};

export type LaunchpadNavigatorChecklist = {
	slug: string;
	title: string;
};

interface NavigatorLaunchpadCellProps {
	checklist: LaunchpadNavigatorChecklist;
}
const NavigatorLaunchpadCell = ( { checklist }: NavigatorLaunchpadCellProps ) => {
	return <div className="launchpad-navigator__navigator-launchpad-cell">{ checklist.title }</div>;
};

interface NavigatorLaunchpadViewHeaderProps {
	setCurrentView: Dispatch< string | null >;
}

const NavigatorLaunchpadViewHeader = ( { setCurrentView }: NavigatorLaunchpadViewHeaderProps ) => {
	return (
		<button
			onClick={ () => setCurrentView( null ) }
			className="launchpad-navigator__navigator-launchpad-view-header"
		>
			Back
		</button>
	);
};

interface LaunchpadNavigatorViewProps {
	siteSlug: string;
	checklist_slug: string;
	setCurrentView: Dispatch< string | null >;
}
const NavigatorLaunchpadView = ( {
	siteSlug,
	checklist_slug,
	setCurrentView,
}: LaunchpadNavigatorViewProps ) => {
	return (
		<div className="launchpad-navigator__navigator-launchpad-view">
			<NavigatorLaunchpadViewHeader setCurrentView={ setCurrentView } />
			<Launchpad siteSlug={ siteSlug } checklistSlug={ checklist_slug } />;
		</div>
	);
};

interface NavigatorLaunchpadListProps {
	checklists: LaunchpadNavigatorChecklist[];
	setCurrentView: Dispatch< string | null >;
}

const NavigatorLaunchpadList = ( { checklists, setCurrentView }: NavigatorLaunchpadListProps ) => {
	return (
		<div className="launchpad-navigator__navigator-launchpad-list">
			{ checklists &&
				checklists.map( ( checklist ) => (
					<div>
						<button onClick={ () => setCurrentView( checklist.slug ) }>
							<NavigatorLaunchpadCell key={ checklist.slug } checklist={ checklist } />
						</button>
					</div>
				) ) }
		</div>
	);
};

const FloatingNavigator = ( { siteSlug }: FloatingNavigatorProps ) => {
	const activeChecklistSlug = select( LaunchpadNavigator.register() ).getActiveChecklistSlug();
	const {
		data: { available_checklists },
	} = useLaunchpadNavigator( siteSlug, activeChecklistSlug );

	const [ currentView, setCurrentView ] = useState< string | null >( null );

	return (
		<Card className="launchpad-navigator__floating-navigator">
			{ ! currentView ? (
				<NavigatorLaunchpadList
					checklists={ available_checklists }
					setCurrentView={ setCurrentView }
				/>
			) : (
				<NavigatorLaunchpadView
					siteSlug={ siteSlug }
					checklist_slug={ currentView }
					setCurrentView={ setCurrentView }
				/>
			) }
		</Card>
	);
};

export default FloatingNavigator;
