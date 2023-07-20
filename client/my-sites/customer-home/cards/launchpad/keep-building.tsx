import { useLaunchpad } from '@automattic/data-stores';
import { isMobile } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ShareSiteModal from '../../components/share-site-modal';
import CustomerHomeLaunchpad from '.';
import type { SiteDetails } from '@automattic/data-stores';
import type { Task } from '@automattic/launchpad';

import './style.scss';

const checklistSlug = 'keep-building';

interface LaunchpadKeepBuildingProps {
	site: SiteDetails | null;
}

const LaunchpadKeepBuilding = ( { site }: LaunchpadKeepBuildingProps ): JSX.Element => {
	const siteSlug = site?.slug || null;

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

	const [ shareSiteModalIsOpen, setShareSiteModalIsOpen ] = useState( false );

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
				case 'add_new_page':
					actionDispatch = () => {
						recordTaskClickTracksEvent( task );
						window.location.assign( `/page/${ siteSlug }` );
					};
					break;
				case 'edit_page':
					actionDispatch = () => {
						recordTaskClickTracksEvent( task );
						window.location.assign( `/pages/${ siteSlug }` );
					};
					break;

				case 'share_site':
					actionDispatch = () => {
						recordTaskClickTracksEvent( task );
						setShareSiteModalIsOpen( true );
					};
					break;
			}

			return { ...task, actionDispatch };
		} );
	};

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ checklistSlug }
				taskFilter={ sortedTasksWithActions }
			></CustomerHomeLaunchpad>
			{ shareSiteModalIsOpen && (
				<ShareSiteModal setModalIsOpen={ setShareSiteModalIsOpen } site={ site } />
			) }
		</>
	);
};

const ConnectedLaunchpadKeepBuilding = connect( ( state ) => {
	const siteId = getSelectedSiteId( state ) || undefined;
	// The type definition for getSite is incorrect, it returns a SiteDetails object
	const site = getSite( state as object, siteId ) as any as SiteDetails;

	return { site };
} )( LaunchpadKeepBuilding );

export default ConnectedLaunchpadKeepBuilding;
