import { useLaunchpad } from '@automattic/data-stores';
import { isMobile } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';
import type { Task } from '@automattic/launchpad';
import type { AppState } from 'calypso/types';

const checklistSlug = 'intent-write';

const LaunchpadIntentWrite = (): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );

	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = numberOfSteps > 0 && completedSteps === numberOfSteps;

	const recordTaskClickTracksEvent = ( task: Task ) => {
		recordTracksEvent( 'calypso_launchpad_task_clicked', {
			checklist_slug: checklistSlug,
			checklist_completed: tasklistCompleted,
			task_id: task.id,
			is_completed: task.completed,
			context: 'customer-home',
		} );
	};

	const sortedTasksWithActions = ( tasks: Task[] ) => {
		const completedTasks = tasks.filter( ( task: Task ) => task.completed );
		const incompleteTasks = tasks.filter( ( task: Task ) => ! task.completed );

		const sortedTasks = [ ...completedTasks, ...incompleteTasks ];

		return sortedTasks.map( ( task: Task ) => {
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
			}

			return { ...task, actionDispatch };
		} );
	};

	return (
		<CustomerHomeLaunchpad
			checklistSlug={ checklistSlug }
			taskFilter={ sortedTasksWithActions }
		></CustomerHomeLaunchpad>
	);
};

export default LaunchpadIntentWrite;
