import { useLaunchpad } from '@automattic/data-stores';
import { Task } from '@automattic/launchpad';
import { isMobile } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';

const checklistSlug = 'blog-flow';

interface LaunchpadKeepBuildingProps {
	siteSlug: string | null;
}

const LaunchpadBlogFlow = ( { siteSlug }: LaunchpadKeepBuildingProps ): JSX.Element => {
	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = completedSteps === numberOfSteps;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
			recordTracksEvent( 'calypso_launchpad_task_view', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: 'customer-home',
			} );

			let actionDispatch;

			switch ( task.id ) {
				case 'my_task_id':
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

const ConnectedLaunchpadBlogFlow = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( LaunchpadBlogFlow );

export default ConnectedLaunchpadBlogFlow;
