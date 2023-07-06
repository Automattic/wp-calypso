import { CircularProgressBar } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { Launchpad, Task } from '@automattic/launchpad';
import { isMobile } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const checklistSlug = 'keep-building';

interface LaunchpadKeepBuildingProps {
	siteSlug: string | null;
}

const LaunchpadKeepBuilding = ( { siteSlug }: LaunchpadKeepBuildingProps ): JSX.Element => {
	const translate = useTranslate();
	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = completedSteps === numberOfSteps;

	const recordTaskClickTracksEvent = ( task: Task ) => {
		recordTracksEvent( 'calypso_launchpad_task_clicked', {
			checklist_slug: checklistSlug,
			checklist_completed: tasklistCompleted,
			task_id: task.id,
			is_completed: task.completed,
			context: 'customer-home',
		} );
	};

	recordTracksEvent( 'calypso_launchpad_tasklist_viewed', {
		checklist_slug: checklistSlug,
		tasks: `,${ checklist?.map( ( task: Task ) => task.id ).join( ',' ) },`,
		is_completed: tasklistCompleted,
		number_of_steps: numberOfSteps,
		number_of_completed_steps: completedSteps,
		context: 'customer-home',
	} );

	recordTracksEvent( 'calypso_launchpad_tasklist_viewed', {
		checklist_slug: checklistSlug,
		tasks: `,${ checklist?.map( ( task: Task ) => task.id ).join( ',' ) },`,
		is_completed: completedSteps === numberOfSteps,
		number_of_steps: numberOfSteps,
		number_of_completed_steps: completedSteps,
		context: 'customer-home',
	} );

	const sortedTasksWithActions = ( tasks: Task[] ) => {
		const completedTasks = tasks.filter( ( task: Task ) => task.completed );
		const incompleteTasks = tasks.filter( ( task: Task ) => ! task.completed );

		const sortedTasks = [ ...completedTasks, ...incompleteTasks ];

		return sortedTasks.map( ( task: Task ) => {
			recordTracksEvent( 'calypso_launchpad_task_view', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: 'customer-home',
			} );

			let actionDispatch;

			switch ( task.id ) {
				case 'site_title':
					actionDispatch = () => {
						recordTaskClickTracksEvent( task );
						window.location.assign( `/settings/general/${ siteSlug }` );
					};
					break;

				case 'design_edited':
					actionDispatch = () => {
						recordTaskClickTracksEvent( task );
						window.location.assign(
							addQueryArgs( `/site-editor/${ siteSlug }`, {
								canvas: 'edit',
							} )
						);
					};
					break;

				case 'domain_claim':
				case 'domain_upsell':
				case 'domain_customize':
					actionDispatch = () => {
						recordTaskClickTracksEvent( task );
						window.location.assign( `/domains/add/${ siteSlug }` );
					};
					break;
				case 'drive_traffic':
					actionDispatch = () => {
						recordTaskClickTracksEvent( task );
						const url = isMobile()
							? `/marketing/connections/${ siteSlug }`
							: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`;
						window.location.assign( url );
					};
					break;
				case 'add_new_page':
					actionDispatch = () => {
						recordTaskClickTracksEvent( task );
						window.location.assign( `/page/${ siteSlug }` );
					};
					break;
			}

			return { ...task, actionDispatch };
		} );
	};

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
			<Launchpad
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				taskFilter={ sortedTasksWithActions }
			/>
		</div>
	);
};

const ConnectedLaunchpadKeepBuilding = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( LaunchpadKeepBuilding );

export default ConnectedLaunchpadKeepBuilding;
