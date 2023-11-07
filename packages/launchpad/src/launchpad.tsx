import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	LaunchpadNavigator,
	Site,
	type SiteSelect,
	sortLaunchpadTasksByCompletionStatus,
	useSortedLaunchpadTasks,
} from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from 'react';
import { ShareSiteModal } from './action-components';
import LaunchpadInternal from './launchpad-internal';
import { setUpActionsForTasks } from './setup-actions';
import type { EventHandlers, Task } from './types';

export const SITE_STORE = Site.register( { client_id: '', client_secret: '' } );

type LaunchpadProps = {
	siteSlug: string | null;
	checklistSlug: string;
	launchpadContext: string;
	onSiteLaunched?: () => void;
	onTaskClick?: EventHandlers[ 'onTaskClick' ];
	onPostFilterTasks?: ( tasks: Task[] ) => Task[];
};

const Launchpad = ( {
	siteSlug,
	checklistSlug,
	launchpadContext,
	onSiteLaunched,
	onTaskClick,
	onPostFilterTasks,
}: LaunchpadProps ) => {
	const {
		data: { checklist },
	} = useSortedLaunchpadTasks( siteSlug, checklistSlug );

	const { setActiveChecklist } = useDispatch( LaunchpadNavigator.store );

	const tasklistCompleted = checklist?.every( ( task: Task ) => task.completed ) || false;

	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;

	const site = useSelect(
		( select ) => {
			return siteSlug && ( select( SITE_STORE ) as SiteSelect ).getSite( siteSlug );
		},
		[ siteSlug ]
	);
	const [ shareSiteModalIsOpen, setShareSiteModalIsOpen ] = useState( false );

	useEffect( () => {
		// Record task list view as a whole.
		recordTracksEvent( 'calypso_launchpad_tasklist_viewed', {
			checklist_slug: checklistSlug,
			tasks: `,${ checklist?.map( ( task: Task ) => task.id ).join( ',' ) },`,
			is_completed: tasklistCompleted,
			number_of_steps: numberOfSteps,
			number_of_completed_steps: completedSteps,
			context: launchpadContext,
		} );

		// Record views for each task.
		checklist?.map( ( task: Task ) => {
			recordTracksEvent( 'calypso_launchpad_task_view', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: launchpadContext,
				order: task.order,
			} );
		} );
	}, [
		checklist,
		checklistSlug,
		completedSteps,
		numberOfSteps,
		tasklistCompleted,
		launchpadContext,
	] );

	const taskFilter = ( tasks: Task[] ) => {
		const baseTasks = setUpActionsForTasks( {
			tasks,
			siteSlug,
			tracksData,
			extraActions: {
				setActiveChecklist,
				setShareSiteModalIsOpen,
			},
			eventHandlers: {
				onSiteLaunched,
				onTaskClick,
			},
		} );

		if ( onPostFilterTasks ) {
			return onPostFilterTasks( baseTasks );
		}

		return baseTasks;
	};

	const launchpadOptions = {
		onSuccess: sortLaunchpadTasksByCompletionStatus,
	};

	return (
		<>
			{ shareSiteModalIsOpen && site && (
				<ShareSiteModal setModalIsOpen={ setShareSiteModalIsOpen } site={ site } />
			) }
			<LaunchpadInternal
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				taskFilter={ taskFilter }
				useLaunchpadOptions={ launchpadOptions }
			/>
		</>
	);
};

export default Launchpad;
