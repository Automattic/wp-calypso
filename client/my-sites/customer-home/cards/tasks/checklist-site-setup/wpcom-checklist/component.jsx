/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';
import page from 'page';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Checklist, Task } from 'components/checklist';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import getSiteTaskList from 'state/selectors/get-site-task-list';
import QueryPosts from 'components/data/query-posts';
import QuerySites from 'components/data/query-sites';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { successNotice } from 'state/notices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import userFactory from 'lib/user';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'state/sites/launch/actions';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import getChecklistTaskUrls, {
	FIRST_TEN_SITE_POSTS_QUERY,
} from 'state/selectors/get-checklist-task-urls';
import { domainManagementEdit, domainManagementList } from 'my-sites/domains/paths';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';
import { localizeUrl } from 'lib/i18n-utils';
import getMenusUrl from 'state/selectors/get-menus-url';

const userLib = userFactory();

class WpcomChecklistComponent extends PureComponent {
	state = {
		pendingRequest: false,
		emailSent: false,
		error: null,
		gSuiteDialogVisible: false,
		selectedTaskId: null,
	};

	constructor() {
		super();

		this.taskFunctions = {
			domain_verified: this.renderDomainVerifiedTask,
			email_verified: this.renderEmailVerifiedTask,
			blogname_set: this.renderBlogNameSetTask,
			mobile_app_installed: this.renderMobileAppInstalledTask,
			site_launched: this.renderSiteLaunchedTask,
			front_page_updated: this.renderFrontPageUpdatedTask,
			site_menu_updated: this.renderSiteMenuUpdateTask,
		};
	}

	handleTaskStart = ( { task, tourId, url } ) => () => {
		if ( ! tourId && ! url ) {
			return;
		}

		this.trackTaskStart( task );

		if ( tourId && ! task.isCompleted && isDesktop() ) {
			this.props.requestGuidedTour( tourId );
		}

		if ( url ) {
			page.show( url );
		}
	};

	trackTaskStart = ( task, props ) => {
		this.props.recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'new_blog',
			site_id: this.props.siteId,
			location: 'checklist_show',
			step_name: task.id,
			completed: task.isCompleted,
			...props,
		} );
	};

	handleTaskDismiss = taskId => () => {
		const { siteId } = this.props;

		if ( taskId ) {
			this.props.requestSiteChecklistTaskUpdate( siteId, taskId );
			this.trackTaskDismiss( taskId );
		}
	};

	trackTaskDismiss = taskId => {
		if ( taskId ) {
			this.props.recordTracksEvent( 'calypso_checklist_task_dismiss', {
				checklist_name: 'new_blog',
				site_id: this.props.siteId,
				step_name: taskId,
			} );
		}
	};

	trackTaskDisplay = ( id, isCompleted, location ) => {
		this.props.recordTracksEvent( 'calypso_checklist_task_display', {
			checklist_name: 'new_blog',
			site_id: this.props.siteId,
			step_name: id,
			completed: isCompleted,
			location,
		} );
	};

	trackExpandTask = ( { id } ) =>
		void this.props.recordTracksEvent( 'calypso_checklist_task_expand', {
			step_name: id,
			product: 'WordPress.com',
		} );

	handleTaskStartThenDismiss = args => () => {
		const { task } = args;
		this.handleTaskStart( args )();
		this.handleTaskDismiss( task.id )();
	};

	handleSendVerificationEmail = e => {
		e.preventDefault();

		if ( this.state.pendingRequest ) {
			return;
		}

		this.setState( {
			pendingRequest: true,
		} );

		userLib.sendVerificationEmail( ( error, response ) => {
			this.setState( {
				emailSent: response && response.success,
				error: error,
				pendingRequest: false,
			} );
		} );
	};

	handleLaunchSite = () => {
		const { siteId } = this.props;
		this.props.launchSiteOrRedirectToLaunchSignupFlow( siteId );
	};

	handleUpdateSiteMenu = () => {
		const { menusUrl, translate } = this.props;
		this.props.openSupportArticleDialog( {
			postId: 59580,
			postUrl: localizeUrl( 'https://wordpress.com/support/menus/' ),
			actionLabel: translate( 'Go to the Customizer' ),
			actionUrl: menusUrl,
		} );
	};

	verificationTaskButtonText() {
		const { translate } = this.props;
		if ( this.state.pendingRequest ) {
			return translate( 'Sending…' );
		}

		if ( this.state.error ) {
			return translate( 'Error' );
		}

		if ( this.state.emailSent ) {
			return translate( 'Email sent' );
		}

		return translate( 'Resend email' );
	}

	render() {
		const { siteId, taskList, taskStatuses, updateCompletion } = this.props;

		return (
			<>
				{ siteId && <QuerySites siteId={ siteId } /> }
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ siteId && <QueryPosts siteId={ siteId } query={ FIRST_TEN_SITE_POSTS_QUERY } /> }
				<Checklist
					isPlaceholder={ ! taskStatuses }
					updateCompletion={ updateCompletion }
					taskList={ taskList }
					onExpandTask={ this.trackExpandTask }
					showChecklistHeader={ false }
				>
					{ taskList.getAll().map( task => this.renderTask( task ) ) }
				</Checklist>
			</>
		);
	}

	renderTask( task ) {
		const { siteSlug } = this.props;

		const TaskComponent = Task;

		const baseProps = {
			id: task.id,
			key: task.id,
			completed: task.isCompleted,
			siteSlug,
			trackTaskDisplay: this.trackTaskDisplay,
		};

		if ( this.shouldRenderTask( task.id ) ) {
			return this.taskFunctions[ task.id ]( TaskComponent, baseProps, task );
		}

		return null;
	}

	shouldRenderTask( taskId ) {
		return typeof this.taskFunctions[ taskId ] !== 'undefined';
	}

	renderEmailVerifiedTask = ( TaskComponent, baseProps ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/illustrations/checkEmailsDesktop.svg"
				buttonText={ this.verificationTaskButtonText() }
				completedTitle={ translate( 'You validated your email address' ) }
				completedDescription={ translate(
					'Need to change something? {{changeButton}}Update your email address here{{/changeButton}}.',
					{
						args: {
							email: this.props.userEmail,
						},
						components: {
							changeButton: <a href="/me/account" />,
						},
					}
				) }
				description={ translate(
					'Please click the link in the email we sent to %(email)s.{{br /}}' +
						'Typo in your email address? {{changeButton}}Change it here{{/changeButton}}.',
					{
						args: {
							email: this.props.userEmail,
						},
						components: {
							br: <br />,
							changeButton: <a href="/me/account" />,
						},
					}
				) }
				// only render an unclickable grey circle when email conformation is incomplete
				disableIcon={ ! baseProps.completed }
				duration={ translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ) }
				onClick={ this.handleSendVerificationEmail }
				title={ translate( 'Confirm your email address' ) }
			/>
		);
	};

	renderBlogNameSetTask = ( TaskComponent, baseProps, task ) => {
		const { translate, siteSlug } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/personalize-your-site.svg"
				completedButtonText={ translate( 'Edit' ) }
				completedDescription={ translate( 'You can edit your site title whenever you like.' ) }
				completedTitle={ translate( 'You updated your site title' ) }
				description={ translate( 'Give your site a descriptive name to entice visitors.' ) }
				duration={ translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					tourId: 'checklistSiteTitle',
					url: `/settings/general/${ siteSlug }`,
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Give your site a name' ) }
				showSkip={ false }
				buttonText={ translate( 'Start' ) }
			/>
		);
	};

	renderDomainVerifiedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, siteSlug } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				buttonText={ translate( 'Verify' ) }
				completedTitle={ translate( 'You verified the email address for your domain' ) }
				description={ translate(
					'We need to check your contact information to make sure you can be reached. Please verify your details using the email we sent you, or your domain will stop working.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					url:
						task.unverifiedDomains.length === 1
							? domainManagementEdit( siteSlug, task.unverifiedDomains[ 0 ] )
							: domainManagementList( siteSlug ),
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={
					task.unverifiedDomains.length === 1
						? translate( 'Verify the email address for %(domainName)s', {
								args: { domainName: task.unverifiedDomains[ 0 ] },
						  } )
						: translate( 'Verify the email address for your domains' )
				}
				showSkip={ false }
			/>
		);
	};

	renderMobileAppInstalledTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/mobile-app.svg"
				completedButtonText={ translate( 'Re-download mobile app' ) }
				completedTitle={ translate( 'You downloaded the WordPress app' ) }
				completedDescription={ translate( 'You can re-download the app at any time.' ) }
				description={ translate(
					'Download the WordPress app to your mobile device to manage your site and follow your stats on the go.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
				onClick={ this.handleTaskStartThenDismiss( {
					task,
					url: '/me/get-apps',
					dismiss: true,
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Get the WordPress app' ) }
				showSkip={ true }
				buttonText={ translate( 'Download mobile app' ) }
			/>
		);
	};

	renderSiteLaunchedTask = ( TaskComponent, baseProps, task ) => {
		const {
			needsEmailVerification,
			needsDomainVerification,
			siteIsUnlaunched,
			translate,
		} = this.props;
		const disabled = ! baseProps.completed && ( needsEmailVerification || needsDomainVerification );
		let noticeText;
		if ( disabled ) {
			if ( needsDomainVerification ) {
				noticeText = translate(
					'Verify the email address for your domain before launching your site.'
				);
			} else if ( needsEmailVerification ) {
				noticeText = translate( 'Confirm your email address before launching your site.' );
			}
		}

		return (
			<TaskComponent
				{ ...baseProps }
				forceCollapsed={ task.isCompleted && ! siteIsUnlaunched }
				bannerImageSrc="/calypso/images/stats/tasks/launch.svg"
				buttonText={ translate( 'Launch site' ) }
				completedButtonText={ siteIsUnlaunched && translate( 'Launch site' ) }
				completedTitle={
					siteIsUnlaunched
						? translate( 'You skipped launching your site' )
						: translate( 'You launched your site' )
				}
				description={
					siteIsUnlaunched
						? translate(
								"Your site is private and only visible to you. When you're ready, launch your site to make it public."
						  )
						: null
				}
				disableIcon={ disabled }
				isButtonDisabled={ disabled }
				noticeText={ noticeText }
				onClick={ this.handleLaunchSite }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				showSkip={ false }
				title={ translate( 'Launch your site' ) }
			/>
		);
	};

	renderFrontPageUpdatedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, taskUrls } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				preset="update-homepage"
				title={ translate( 'Update your homepage' ) }
				completedTitle={ translate( 'You updated your homepage' ) }
				bannerImageSrc="/calypso/images/stats/tasks/personalize-your-site.svg"
				completedButtonText={ translate( 'Edit homepage' ) }
				description={ translate(
					`We've created the basics, now it's time for you to update the images and text.`
				) }
				completedDescription={ translate(
					`Edit your page anytime you want to change the text or images.`
				) }
				steps={ [] }
				duration={ translate( '%d minute', '%d minutes', { count: 20, args: [ 20 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					url: taskUrls[ task.id ],
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				showSkip={ false }
				buttonText={ translate( 'Update homepage' ) }
				action="update-homepage"
			/>
		);
	};

	renderSiteMenuUpdateTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/personalize-your-site.svg"
				completedButtonText={ translate( 'View tutorial' ) }
				completedDescription={ translate( 'You can edit your site menu whenever you like.' ) }
				completedTitle={ translate( 'You created a site menu' ) }
				description={ translate(
					"Building an effective navigation menu makes it easier for someone to find what they're looking for and improve search engine rankings."
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ) }
				onClick={ () => {
					this.trackTaskStart( task );
					this.handleUpdateSiteMenu();
				} }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Create a site menu' ) }
				showSkip={ true }
				buttonText={ translate( 'Start with a tutorial' ) }
			/>
		);
	};
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const siteChecklist = getSiteChecklist( state, siteId );
		const user = getCurrentUser( state );
		const taskUrls = getChecklistTaskUrls( state, siteId );
		const taskList = getSiteTaskList( state, siteId );

		const needsEmailVerification = ! isCurrentUserEmailVerified( state );
		/* eslint-disable wpcalypso/redux-no-bound-selectors */
		const needsDomainVerification =
			taskList.getAll().filter( task => task.id === 'domain_verified' && ! task.isCompleted )
				.length > 0;
		/* eslint-enable wpcalypso/redux-no-bound-selectors */

		return {
			siteId,
			siteSlug,
			taskStatuses: get( siteChecklist, 'tasks' ),
			taskUrls,
			taskList,
			userEmail: ( user && user.email ) || '',
			needsEmailVerification,
			needsDomainVerification,
			siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
			menusUrl: getMenusUrl( state, siteId ),
		};
	},
	{
		successNotice,
		recordTracksEvent,
		requestGuidedTour,
		requestSiteChecklistTaskUpdate,
		launchSiteOrRedirectToLaunchSignupFlow,
		openSupportArticleDialog,
	}
)( localize( WpcomChecklistComponent ) );
