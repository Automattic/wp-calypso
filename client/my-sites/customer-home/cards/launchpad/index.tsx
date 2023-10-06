import { Button, CircularProgressBar, Gridicon } from '@automattic/components';
import {
	updateLaunchpadSettings,
	useLaunchpad,
	sortLaunchpadTasksByCompletionStatus,
	LaunchpadNavigator,
} from '@automattic/data-stores';
import { Launchpad, Task, setUpActionsForTasks, ShareSiteModal } from '@automattic/launchpad';
import { select, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useLaunchpadNavigator } from 'calypso/data/launchpad-navigator/use-launchpad-navigator';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

import './style.scss';

interface CustomerHomeLaunchpadProps {
	checklistSlug: string;
	onSiteLaunched?: () => void;
}

const CustomerHomeLaunchpad = ( {
	checklistSlug,
	onSiteLaunched,
}: CustomerHomeLaunchpadProps ): JSX.Element => {
	const launchpadContext = 'customer-home';
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );

	const site = useSelector( ( state: AppState ) => siteId && getSite( state as object, siteId ) );

	const translate = useTranslate();
	const [ isDismissed, setIsDismissed ] = useState( false );
	const useLaunchpadOptions = { onSuccess: sortLaunchpadTasksByCompletionStatus };
	const {
		data: { checklist, is_dismissed: initialIsChecklistDismissed },
	} = useLaunchpad( siteSlug, checklistSlug, useLaunchpadOptions );

	useEffect( () => {
		setIsDismissed( initialIsChecklistDismissed );
	}, [ initialIsChecklistDismissed ] );

	const [ shareSiteModalIsOpen, setShareSiteModalIsOpen ] = useState( false );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = completedSteps === numberOfSteps;
	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };
	const hasShareSiteTask = checklist?.some( ( task: Task ) => task.id === 'share_site' );
	const { setActiveChecklist, receiveActiveChecklistSlug } = useDispatch(
		LaunchpadNavigator.store
	);

	const defaultExtraActions = {
		...( hasShareSiteTask ? { setShareSiteModalIsOpen } : {} ),
		setActiveChecklist,
	};

	const currentNavigatorChecklistSlug =
		select( LaunchpadNavigator.store ).getActiveChecklistSlug() || null;
	const {
		data: { current_checklist },
	} = useLaunchpadNavigator( siteSlug, currentNavigatorChecklistSlug );
	useEffect( () => {
		receiveActiveChecklistSlug( current_checklist );
	}, [ current_checklist ] );

	const taskFilter = ( tasks: Task[] ) => {
		return setUpActionsForTasks( {
			tasks,
			siteSlug,
			tracksData,
			extraActions: defaultExtraActions,
			eventHandlers: {
				onSiteLaunched,
			},
		} );
	};

	useEffect( () => {
		// Record task list view as a whole.
		recordTracksEvent( 'calypso_launchpad_tasklist_viewed', {
			checklist_slug: checklistSlug,
			tasks: `,${ checklist?.map( ( task: Task ) => task.id ).join( ',' ) },`,
			is_completed: tasklistCompleted,
			number_of_steps: numberOfSteps,
			number_of_completed_steps: completedSteps,
			context: 'customer-home',
		} );

		// Record views for each task.
		checklist?.map( ( task: Task ) => {
			recordTracksEvent( 'calypso_launchpad_task_view', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: 'customer-home',
				order: task.order,
			} );
		} );
	}, [ checklist, checklistSlug, completedSteps, numberOfSteps, tasklistCompleted ] );

	// return nothing if the launchpad is dismissed
	if ( isDismissed ) {
		return <></>;
	}

	return (
		<div className="customer-home-launchpad">
			<div className="customer-home-launchpad__header">
				<h2 className="customer-home-launchpad__title">
					{ translate( 'Next steps for your site' ) }
				</h2>
				{ numberOfSteps > completedSteps ? (
					<div className="customer-home-launchpad__progress-bar-container">
						<CircularProgressBar
							size={ 40 }
							enableDesktopScaling
							numberOfSteps={ numberOfSteps }
							currentStep={ completedSteps }
						/>
					</div>
				) : (
					<div className="customer-home-launchpad__dismiss-button">
						<Button
							className="themes__activation-modal-close-icon"
							borderless
							onClick={ () => {
								if ( ! siteSlug ) {
									return;
								}

								updateLaunchpadSettings( siteSlug, {
									is_checklist_dismissed: {
										slug: checklistSlug,
										is_dismissed: true,
									},
								} );
								setIsDismissed( true );

								recordTracksEvent( 'calypso_launchpad_dismiss_guide', {
									checklist_slug: checklistSlug,
									context: 'customer-home',
								} );
							} }
						>
							<div> { translate( 'Dismiss guide' ) } </div>
							<Gridicon icon="cross" size={ 12 } />
						</Button>
					</div>
				) }
			</div>
			{ shareSiteModalIsOpen && site && (
				<ShareSiteModal setModalIsOpen={ setShareSiteModalIsOpen } site={ site } />
			) }
			<Launchpad
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				taskFilter={ taskFilter }
				useLaunchpadOptions={ useLaunchpadOptions }
				context={ launchpadContext }
			/>
		</div>
	);
};

export default CustomerHomeLaunchpad;
