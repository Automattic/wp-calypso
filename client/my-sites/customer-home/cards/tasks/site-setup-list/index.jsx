/**
 * External dependencies
 */
import { Card, Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { translate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelCta from 'components/action-panel/cta';
import CardHeading from 'components/card-heading';
import { getTaskList } from 'lib/checklist';
import { localizeUrl } from 'lib/i18n-utils';
import Gridicon from 'components/gridicon';
import { domainManagementEdit, domainManagementList } from 'my-sites/domains/paths';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';
import getChecklistTaskUrls from 'state/selectors/get-checklist-task-urls';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import getMenusUrl from 'state/selectors/get-menus-url';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'state/sites/launch/actions';
import { getSiteOption, getSiteSlug } from 'state/sites/selectors';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import NavItem from './nav-item';

/**
 * Style dependencies
 */
import './style.scss';

const getTaskData = ( task, { menusUrl, siteId, siteSlug, taskUrls, userEmail } = {} ) => {
	let taskData = {};
	switch ( task.id ) {
		case 'domain_verified':
			taskData = {
				timing: 2,
				title:
					task.unverifiedDomains.length === 1
						? translate( 'Verify the email address for %(domainName)s', {
								args: { domainName: task.unverifiedDomains[ 0 ] },
						  } )
						: translate( 'Verify the email address for your domains' ),
				description: translate(
					'We need to check your contact information to make sure you can be reached. Please verify your details using the email we sent you, or your domain will stop working.'
				),
				actionUrl:
					task.unverifiedDomains.length === 1
						? domainManagementEdit( siteSlug, task.unverifiedDomains[ 0 ] )
						: domainManagementList( siteSlug ),
				actionText: translate( 'Verify' ),
			};
			break;
		case 'email_verified':
			taskData = {
				timing: 1,
				title: translate( 'Confirm your email address' ),
				description: translate(
					'Please click the link in the email we sent to %(email)s.' +
						'Typo in your email address? {{changeButton}}Change it here{{/changeButton}}.',
					{
						args: {
							email: userEmail,
						},
						components: {
							br: <br />,
							changeButton: <a href="/me/account" />,
						},
					}
				),
				//TODO: looks like there's some more complicated text states here
				actionText: translate( 'Verify email' ),
			};
			break;
		case 'blogname_set':
			taskData = {
				timing: 1,
				title: translate( 'Name your site' ),
				description: translate(
					'Give your new site a title to let people know what your site is about. A good title introduces your brand and the primary topics of your site.'
				),
				actionText: translate( 'Name your site' ),
				actionUrl: `/settings/general/${ siteSlug }`,
				tour: 'checklistSiteTitle',
			};
			break;
		case 'mobile_app_installed':
			taskData = {
				timing: 3,
				title: translate( 'Get the WordPress app' ),
				description: translate(
					'Download the WordPress app to your mobile device to manage your site and follow your stats on the go.'
				),
				actionText: translate( 'Download mobile app' ),
				actionUrl: '/me/get-apps',
				...( ! task.isCompleted && {
					actionDispatch: requestSiteChecklistTaskUpdate,
					actionDispatchArgs: [ siteId, task.id ],
				} ),
				isSkippable: true,
			};
			break;
		case 'site_launched':
			taskData = {
				timing: 1,
				title: translate( 'Launch your site' ),
				description: translate(
					"Your site is private and only visible to you. When you're ready, launch your site to make it public."
				),
				actionText: translate( 'Launch site' ),
				actionDispatch: launchSiteOrRedirectToLaunchSignupFlow,
				actionDispatchArgs: [ siteId ],
			};
			break;
		case 'front_page_updated':
			taskData = {
				timing: 20,
				title: translate( 'Update your Home page' ),
				description: translate(
					"We've created the basics, now it's time for you to update the images and text. Make a great first impression. Everything you do can be changed anytime."
				),
				actionText: translate( 'Edit homepage' ),
			};
			break;
		case 'site_menu_updated':
			taskData = {
				timing: 10,
				title: translate( 'Create a site menu' ),
				description: translate(
					"Building an effective navigation menu makes it easier for someone to find what they're looking for and improve search engine rankings."
				),
				actionText: translate( 'View tutorial' ),
				isSkippable: true,
				actionDispatch: openSupportArticleDialog,
				actionDispatchArgs: [
					{
						postId: 59580,
						postUrl: localizeUrl( 'https://wordpress.com/support/menus/' ),
						actionLabel: translate( 'Go to the Customizer' ),
						actionUrl: menusUrl,
					},
				],
			};
			break;
	}
	return {
		...task,
		actionUrl: taskUrls[ task.id ],
		...taskData,
	};
};

const startTask = ( dispatch, task, siteId ) => {
	dispatch(
		recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'new_blog',
			site_id: siteId,
			location: 'checklist_show',
			step_name: task.id,
			completed: task.isCompleted,
		} )
	);

	if ( task.tour && ! task.isCompleted && isDesktop() ) {
		dispatch( requestGuidedTour( task.tour ) );
	}

	if ( task.actionUrl ) {
		page.show( task.actionUrl );
	}

	if ( task.actionDispatch ) {
		dispatch( task.actionDispatch( ...task.actionDispatchArgs ) );
	}
};

const skipTask = ( dispatch, task, siteId ) => {
	dispatch( requestSiteChecklistTaskUpdate( siteId, task.id ) );
	dispatch(
		recordTracksEvent( 'calypso_checklist_task_dismiss', {
			checklist_name: 'new_blog',
			site_id: siteId,
			step_name: task.id,
		} )
	);
};

const SiteSetupList = ( { menusUrl, siteId, siteSlug, tasks, taskUrls } ) => {
	const [ currentTask, setCurrentTask ] = useState( null );
	const dispatch = useDispatch();

	const getTask = ( task ) =>
		getTaskData( task, {
			menusUrl,
			siteId,
			siteSlug,
			taskUrls,
		} );

	useEffect( () => {
		// Initial task.
		if ( ! currentTask && tasks.length ) {
			const initialTask = getTask( tasks.find( ( task ) => ! task.isCompleted ) );
			setCurrentTask( initialTask );
		}

		// Move to next task after after completing current one.
		if ( currentTask && tasks.length ) {
			const isCurrentTaskCompleted = tasks.find( ( task ) => task.id === currentTask.id )
				.isCompleted;
			if ( isCurrentTaskCompleted && ! currentTask.isCompleted ) {
				const nextTask = getTask( tasks.find( ( task ) => ! task.isCompleted ) );
				setCurrentTask( nextTask );
			}
		}
	}, [ currentTask, tasks ] );

	if ( ! tasks.length || ! currentTask ) {
		return null;
	}

	return (
		<Card className="site-setup-list">
			<div className="site-setup-list__nav">
				<CardHeading>{ translate( 'Site setup' ) }</CardHeading>
				{ tasks.map( ( task ) => (
					<NavItem
						key={ task.id }
						text={ getTask( task ).title }
						isCompleted={ task.isCompleted }
						isCurrent={ task.id === currentTask.id }
						onClick={ () => setCurrentTask( getTask( task ) ) }
					/>
				) ) }
			</div>
			<ActionPanel className="site-setup-list__task task">
				<ActionPanelBody>
					<div className="site-setup-list__task-text task__text">
						<div className="site-setup-list__task-timing task__timing">
							<Gridicon icon="time" size={ 18 } />
							<p>
								{ translate( '%d minute', '%d minutes', {
									count: currentTask.timing,
									args: [ currentTask.timing ],
								} ) }
							</p>
						</div>
						<ActionPanelTitle>{ currentTask.title }</ActionPanelTitle>
						<p className="site-setup-list__task-description task__description">
							{ currentTask.description }
						</p>
						<ActionPanelCta>
							<Button
								className="site-setup-list__task-action task__action"
								primary
								onClick={ () => startTask( dispatch, currentTask, siteId ) }
							>
								{ currentTask.actionText }
							</Button>
							{ currentTask.isSkippable && ! currentTask.isCompleted && (
								<Button
									className="site-setup-list__task-skip task__skip is-link"
									onClick={ () => skipTask( dispatch, currentTask, siteId ) }
								>
									{ translate( 'Skip for now' ) }
								</Button>
							) }
						</ActionPanelCta>
					</div>
				</ActionPanelBody>
			</ActionPanel>
		</Card>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const designType = getSiteOption( state, siteId, 'design_type' );
	const siteChecklist = getSiteChecklist( state, siteId );
	const siteSegment = siteChecklist?.segment;
	const siteVerticals = siteChecklist?.vertical;
	const taskStatuses = siteChecklist?.tasks;
	const siteIsUnlaunched = isUnlaunchedSite( state, siteId );
	const taskList = getTaskList( {
		taskStatuses,
		designType,
		siteIsUnlaunched,
		siteSegment,
		siteVerticals,
	} );

	return {
		menusUrl: getMenusUrl( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		tasks: taskList.getAll(),
		taskUrls: getChecklistTaskUrls( state, siteId ),
	};
} )( SiteSetupList );
