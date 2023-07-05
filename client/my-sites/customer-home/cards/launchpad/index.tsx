import { CircularProgressBar } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { Launchpad, Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

interface CustomerHomeLaunchpadProps {
	siteSlug: string | null;
	checklistSlug: string;
	taskFilter: ( tasks: Task[] ) => Task[];
}

const CustomerHomeLaunchpad = ( {
	siteSlug,
	checklistSlug,
	taskFilter,
}: CustomerHomeLaunchpadProps ): JSX.Element => {
	const translate = useTranslate();
	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = completedSteps === numberOfSteps;

	recordTracksEvent( 'calypso_launchpad_tasklist_viewed', {
		checklist_slug: checklistSlug,
		tasks: `,${ checklist?.map( ( task: Task ) => task.id ).join( ',' ) },`,
		is_completed: tasklistCompleted,
		number_of_steps: numberOfSteps,
		number_of_completed_steps: completedSteps,
		context: 'customer-home',
	} );

	return (
		<div className="launchpad-keep-building">
			<div className="launchpad-keep-building__header">
				<h2 className="launchpad-keep-building__title">
					{ translate( 'Next steps for your site' ) }
				</h2>
				<div className="launchpad-keep-building__progress-bar-container">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						numberOfSteps={ numberOfSteps }
						currentStep={ completedSteps }
					/>
				</div>
			</div>
			<Launchpad siteSlug={ siteSlug } checklistSlug={ checklistSlug } taskFilter={ taskFilter } />
		</div>
	);
};

const ConnectedCustomerHomeLaunchpad = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( CustomerHomeLaunchpad );

export default ConnectedCustomerHomeLaunchpad;
