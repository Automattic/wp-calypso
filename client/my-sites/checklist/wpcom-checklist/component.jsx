/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { find, get, some, includes, forEach } from 'lodash';
import { isDesktop } from 'lib/viewport';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getTaskList } from './wpcom-task-list';
import Checklist from 'components/checklist';
import ChecklistBanner from './checklist-banner';
import ChecklistBannerTask from './checklist-banner/task';
import ChecklistNavigation from './checklist-navigation';
import ChecklistPrompt from './checklist-prompt';
import ChecklistPromptTask from './checklist-prompt/task';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import QueryPosts from 'components/data/query-posts';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import Task from 'components/checklist/task';
import { createNotice } from 'state/notices/actions';
import { getPostsForQuery } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption, getSiteSlug, getSiteFrontPage } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import userFactory from 'lib/user';
import { launchSite } from 'state/sites/launch/actions';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import createSelector from 'lib/create-selector';
import { getLoginUrlWithTOSRedirect } from 'lib/google-apps';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import {
	showInlineHelpPopover,
	showChecklistPrompt,
	setChecklistPromptTaskId,
	setChecklistPromptStep,
} from 'state/inline-help/actions';
import { getChecklistPromptStep } from 'state/inline-help/selectors';
import getEditorUrl from 'state/selectors/get-editor-url';
import getCurrentRoute from 'state/selectors/get-current-route';

const userLib = userFactory();

const FIRST_TEN_SITE_POSTS_QUERY = { type: 'any', number: 10, order_by: 'ID', order: 'ASC' };

class WpcomChecklistComponent extends PureComponent {
	state = {
		pendingRequest: false,
		emailSent: false,
		error: null,
	};
	trackedTaskDisplays = {};

	constructor() {
		super();

		this.taskFunctions = {
			email_verified: this.renderEmailVerifiedTask,
			site_created: this.renderSiteCreatedTask,
			address_picked: this.renderAddressPickedTask,
			blogname_set: this.renderBlogNameSetTask,
			site_icon_set: this.renderSiteIconSetTask,
			blogdescription_set: this.renderBlogDescriptionSetTask,
			avatar_uploaded: this.renderAvatarUploadedTask,
			contact_page_updated: this.renderContactPageUpdatedTask,
			post_published: this.renderPostPublishedTask,
			custom_domain_registered: this.renderCustomDomainRegisteredTask,
			mobile_app_installed: this.renderMobileAppInstalledTask,
			site_launched: this.renderSiteLaunchedTask,
			email_setup: this.renderEmailSetupTask,
			email_forwarding_upgraded_to_gsuite: this.renderEmailForwardingUpgradedToGSuiteTask,
			gsuite_tos_accepted: this.renderGSuiteTOSAcceptedTask,
			about_text_updated: this.renderAboutTextUpdatedTask,
			homepage_photo_updated: this.renderHomepagePhotoUpdatedTask,
			business_hours_added: this.renderBusinessHoursAddedTask,
			service_list_added: this.renderServiceListAddedTask,
			staff_info_added: this.renderStaffInfoAddedTask,
			product_list_added: this.renderProductListAddedTask,
			menu_added: this.renderMenuAddedTask,
			portfolio_item_added: this.renderPortfolioItemAddedTask,
			mission_statement_added: this.renderMissionStatementAddedTask,
			qualifications_added: this.renderQualificationsAddedTask,
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
		let location;

		switch ( this.props.viewMode ) {
			case 'banner':
				location = 'checklist_banner';
				break;
			case 'prompt':
				location = 'checklist_prompt';
				break;
			default:
				location = 'checklist_show';
		}

		this.props.recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'new_blog',
			site_id: this.props.siteId,
			location,
			step_name: task.id,
			completed: task.isCompleted,
			...props,
		} );
	};

	handleTaskDismiss = taskId => () => {
		const { siteId } = this.props;

		if ( taskId ) {
			this.props.createNotice( 'is-success', 'You completed a task!' );
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

	trackTaskDisplayOnce = task => {
		if ( this.trackedTaskDisplays[ task.id ] ) {
			return;
		}
		this.trackedTaskDisplays[ task.id ] = true;

		this.props.recordTracksEvent( 'calypso_checklist_task_display', {
			checklist_name: 'new_blog',
			site_id: this.props.siteId,
			step_name: task.id,
			completed: task.isCompleted,
		} );
	};

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

	handleLaunchSite = task => () => {
		if ( task.isCompleted ) {
			return;
		}

		const { siteId } = this.props;

		this.props.launchSite( siteId );
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

	handleInlineHelpProgress = ( task, isPrompt ) => () => {
		const { taskUrls, taskStep, currentRoute } = this.props;

		if ( isPrompt ) {
			this.props.setChecklistPromptStep( taskStep + 1 );
		} else {
			this.props.setChecklistPromptTaskId( task.id );
			this.props.setChecklistPromptStep( 0 );
			this.props.showInlineHelpPopover();
			this.props.showChecklistPrompt();
		}

		if ( currentRoute !== taskUrls[ task.id ] ) {
			page( taskUrls[ task.id ] );
		}
	};

	handleInlineHelpDismiss = ( taskId, { maxStep } ) => () => {
		this.handleTaskDismiss( taskId )();
		if ( maxStep ) {
			this.props.setChecklistPromptStep( maxStep );
		}
	};

	handleInlineHelpNext = () => {
		const taskList = getTaskList( this.props );
		const firstIncomplete = taskList.getFirstIncompleteTask();

		if ( firstIncomplete ) {
			this.props.setChecklistPromptStep( 0 );
			this.handleInlineHelpProgress( firstIncomplete, false )();
		} else {
			this.backToChecklist();
		}
	};

	backToChecklist = () => {
		page( `/checklist/${ this.props.siteSlug }` );
	};

	render() {
		const {
			siteId,
			taskStatuses,
			taskUrls,
			viewMode,
			updateCompletion,
			setNotification,
			setStoredTask,
			closePopover,
			showNotification,
			storedTask,
		} = this.props;

		const taskList = getTaskList( this.props );

		// Hide a task when we can't find the exact URL of the target page.
		forEach( taskUrls, ( url, taskId ) => {
			if ( ! url ) {
				taskList.remove( taskId );
			}
		} );

		let ChecklistComponent = Checklist;

		switch ( viewMode ) {
			case 'banner':
				ChecklistComponent = ChecklistBanner;
				break;
			case 'navigation':
				ChecklistComponent = ChecklistNavigation;
				break;
			case 'prompt':
				ChecklistComponent = ChecklistPrompt;
				break;
			case 'notification':
				return null;
		}

		return (
			<>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ siteId && <QueryPosts siteId={ siteId } query={ FIRST_TEN_SITE_POSTS_QUERY } /> }
				<ChecklistComponent
					isPlaceholder={ ! taskStatuses }
					updateCompletion={ updateCompletion }
					closePopover={ closePopover }
					showNotification={ showNotification }
					setNotification={ setNotification }
					setStoredTask={ setStoredTask }
					storedTask={ storedTask }
					taskList={ taskList }
				>
					{ taskList.getAll().map( task => this.renderTask( task ) ) }
				</ChecklistComponent>
			</>
		);
	}

	componentDidUpdate() {
		const taskList = getTaskList( this.props );
		taskList.getAll().forEach( task => {
			if ( this.shouldRenderTask( task.id ) ) {
				this.trackTaskDisplayOnce( task );
			}
		} );
	}

	renderTask( task ) {
		const { siteSlug, viewMode, closePopover } = this.props;

		let TaskComponent = Task;

		switch ( viewMode ) {
			case 'banner':
				TaskComponent = ChecklistBannerTask;
				break;
			case 'prompt':
				TaskComponent = ChecklistPromptTask;
				break;
		}

		const taskList = getTaskList( this.props );
		const firstIncomplete = taskList.getFirstIncompleteTask();

		const baseProps = {
			id: task.id,
			key: task.id,
			completed: task.isCompleted,
			siteSlug,
			firstIncomplete,
			buttonPrimary: firstIncomplete && firstIncomplete.id === task.id,
			closePopover: closePopover,
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
				duration={ translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ) }
				onClick={ this.handleSendVerificationEmail }
				title={ translate( 'Confirm your email address' ) }
			/>
		);
	};

	renderSiteCreatedTask = ( TaskComponent, baseProps ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				completedTitle={ translate( 'You created your site' ) }
				description={ translate( 'This is where your adventure begins.' ) }
				title={ translate( 'Create your site' ) }
			/>
		);
	};

	renderAddressPickedTask = ( TaskComponent, baseProps ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				completedTitle={ translate( 'You picked a website address' ) }
				description={ translate( 'Choose an address so people can find you on the internet.' ) }
				title={ translate( 'Pick a website address' ) }
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
			/>
		);
	};

	renderSiteIconSetTask = ( TaskComponent, baseProps, task ) => {
		const { translate, siteSlug } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/upload-icon.svg"
				completedButtonText={ translate( 'Change' ) }
				completedTitle={ translate( 'You uploaded a site icon' ) }
				description={ translate(
					'Help people recognize your site in browser tabs — just like the WordPress.com W!'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					tourId: 'checklistSiteIcon',
					url: `/settings/general/${ siteSlug }`,
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Upload a site icon' ) }
			/>
		);
	};

	renderBlogDescriptionSetTask = ( TaskComponent, baseProps, task ) => {
		const { translate, siteSlug } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/create-tagline.svg"
				completedButtonText={ translate( 'Change' ) }
				completedTitle={ translate( 'You created a tagline' ) }
				description={ translate(
					'Pique readers’ interest with a little more detail about your site.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					tourId: 'checklistSiteTagline',
					url: `/settings/general/${ siteSlug }`,
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Create a tagline' ) }
			/>
		);
	};

	renderAvatarUploadedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/upload-profile-picture.svg"
				completedButtonText={ translate( 'Change' ) }
				completedTitle={ translate( 'You uploaded a profile picture' ) }
				description={ translate(
					'Who’s the person behind the site? Personalize your posts and comments with a custom profile picture.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					tourId: 'checklistUserAvatar',
					url: '/me',
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Upload your profile picture' ) }
			/>
		);
	};

	renderContactPageUpdatedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, taskUrls } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/contact.svg"
				completedButtonText={ translate( 'Edit' ) }
				completedTitle={ translate( 'You updated your Contact page' ) }
				description={ translate(
					'Encourage visitors to get in touch — a website is for connecting with people.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					tourId: 'checklistContactPage',
					url: taskUrls.contact_page_updated,
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Personalize your Contact page' ) }
			/>
		);
	};

	renderPostPublishedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, taskUrls } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/first-post.svg"
				completedButtonText={ translate( 'Edit' ) }
				completedTitle={ translate( 'You published your first blog post' ) }
				description={ translate( 'Introduce yourself to the world! That’s why you’re here.' ) }
				duration={ translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					tourId: 'checklistPublishPost',
					url: taskUrls.post_published,
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Publish your first blog post' ) }
			/>
		);
	};

	renderCustomDomainRegisteredTask = ( TaskComponent, baseProps, task ) => {
		const { translate, siteSlug } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/custom-domain.svg"
				completedButtonText={ translate( 'Change' ) }
				completedTitle={ translate( 'You registered a custom domain' ) }
				description={ translate(
					'Memorable domain names make it easy for people to remember your address — and search engines love ’em.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
				onClick={ this.handleTaskStart( {
					task,
					tourId: 'checklistDomainRegister',
					url: `/domains/add/${ siteSlug }`,
				} ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Register a custom domain' ) }
			/>
		);
	};

	renderMobileAppInstalledTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/mobile-app.svg"
				completedButtonText={ translate( 'Download' ) }
				completedTitle={ translate( 'You downloaded the WordPress app' ) }
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
			/>
		);
	};

	renderSiteLaunchedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/launch.svg"
				buttonText={ translate( 'Launch site' ) }
				completedTitle={ translate( 'You launched your site' ) }
				description={ translate(
					'Your site is private and only visible to you. Launch your site, when you are ready to make it public.'
				) }
				onClick={ this.handleLaunchSite( task ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				title={ translate( 'Launch your site' ) }
			/>
		);
	};

	renderEmailSetupTask = ( TaskComponent, baseProps, task ) => {
		const { translate, siteSlug } = this.props;

		const clickProps = baseProps.completed
			? {}
			: {
					onClick: () => {
						this.trackTaskStart( task );
						page( `/domains/manage/email/${ siteSlug }` );
					},
					onDismiss: () => this.handleTaskDismiss( task.id ),
			  };

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Get email for your site' ) }
				completedTitle={ translate( 'You set up email for your site' ) }
				bannerImageSrc={ '/calypso/images/stats/tasks/email.svg' } // TODO: get an actual svg for this
				description={ translate(
					'Subscribe to G Suite to get a dedicated inbox, docs, and cloud storage.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 5, args: [ 5 ] } ) }
				{ ...clickProps }
			/>
		);
	};

	renderEmailForwardingUpgradedToGSuiteTask = ( TaskComponent, baseProps, task ) => {
		const { translate, siteSlug } = this.props;

		baseProps.completed = true;
		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Get email for your site' ) }
				completedTitle={ translate( 'You set up email forwarding for your site' ) }
				bannerImageSrc={ '/calypso/images/stats/tasks/email.svg' } // TODO: get an actual svg for this
				completedDescription={ translate(
					'Want a dedicated inbox, docs, and cloud storage? {{link}}Upgrade to G Suite!{{/link}}',
					{
						components: {
							link: (
								<a
									onClick={ () => this.trackTaskStart( task, { clicked_element: 'hyperlink' } ) }
									href={ `/domains/manage/email/${ siteSlug }` }
								/>
							),
						},
					}
				) }
				completedButtonText={ translate( 'Upgrade' ) }
				onClick={ () => {
					this.trackTaskStart( task, { clicked_element: 'button' } );
					page( `/domains/manage/email/${ siteSlug }` );
				} }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderGSuiteTOSAcceptedTask = ( TaskComponent, baseProps, task ) => {
		const { domains, translate } = this.props;

		let loginUrlWithTOSRedirect;
		if ( Array.isArray( domains ) && domains.length > 0 ) {
			const domainName = domains[ 0 ].name;
			const users = domains[ 0 ].googleAppsSubscription.pendingUsers;
			loginUrlWithTOSRedirect = getLoginUrlWithTOSRedirect( users[ 0 ], domainName );
		}

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Accept the G Suite TOS to complete email setup' ) }
				description={ translate( "You're almost done setting up G Suite!" ) }
				isWarning={ true }
				onClick={ () => {
					if ( ! loginUrlWithTOSRedirect ) {
						return;
					}

					this.trackTaskStart( task, {
						sub_step_name: 'gsuite_tos_accepted',
					} );
					window.open( loginUrlWithTOSRedirect, '_blank' );
				} }
			/>
		);
	};

	renderAboutTextUpdatedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, viewMode, taskStep } = this.props;
		const isPrompt = viewMode === 'prompt';
		const taskProps = Object.assign( {}, baseProps, {
			title: translate( 'Edit About text' ),
			description: translate(
				'Update the text we’ve written for you to describe what makes your business unique. ' +
					'Make your homepage speak to your customers.'
			),
			duration: translate( '%d minute', '%d minutes', { count: 5, args: [ 5 ] } ),
			onClick: this.handleInlineHelpProgress( task, isPrompt ),
			onDismiss: this.handleTaskDismiss( task.id ),
			isPrompt,
		} );

		if ( isPrompt ) {
			taskProps.onDismiss = this.handleInlineHelpDismiss( task.id, { maxStep: 2 } );
			taskProps.canDismiss = taskStep !== 1;
			taskProps.autoCloseOnAction = false;

			switch ( taskStep ) {
				case 0:
					taskProps.buttonText = translate( 'Try it' );
					taskProps.dismissButtonText = translate( 'Mark complete' );
					break;
				case 1:
					taskProps.title = translate( 'Update your homepage text' );
					taskProps.description = translate(
						'Task a moment to review what we’ve written for you. ' +
							'Click the text to make any additions or changes.'
					);
					taskProps.onClick = taskProps.onDismiss;
					taskProps.buttonText = translate( 'Done editing' );
					taskProps.duration = null;
					break;
				case 2:
					taskProps.title = translate( 'Homepage updated!' );
					taskProps.buttonText = translate( 'Next task' );
					taskProps.dismissButtonText = translate( 'View all tasks' );
					taskProps.onClick = this.handleInlineHelpNext;
					taskProps.onDismiss = this.backToChecklist;
					taskProps.duration = null;
					taskProps.autoCloseOnAction = true;
					break;
			}
		}

		return <TaskComponent { ...taskProps } />;
	};

	renderHomepagePhotoUpdatedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, viewMode, taskStep } = this.props;
		const isPrompt = viewMode === 'prompt';
		const taskProps = Object.assign( {}, baseProps, {
			title: translate( 'Change homepage photo' ),
			description: translate(
				'Upload your own photoo or choose from a wide selection of free ones to personalize your new site.'
			),
			duration: translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ),
			onClick: this.handleInlineHelpProgress( task, isPrompt ),
			onDismiss: this.handleTaskDismiss( task.id ),
			isPrompt,
		} );

		if ( isPrompt ) {
			taskProps.onDismiss = this.handleInlineHelpDismiss( task.id, { maxStep: 2 } );
			taskProps.canDismiss = taskStep !== 1;
			taskProps.autoCloseOnAction = false;

			switch ( taskStep ) {
				case 0:
					taskProps.buttonText = translate( 'Try it' );
					taskProps.dismissButtonText = translate( 'Mark complete' );
					break;
				case 1:
					taskProps.title = translate( 'Upload a photo or choose a new one from ours' );
					taskProps.description = translate(
						'Make a good first impression. ' +
							'Change your cover photo by uploading your own or choose from a selection of free ones.'
					);
					taskProps.onClick = taskProps.onDismiss;
					taskProps.buttonText = translate( 'Done editing' );
					taskProps.duration = null;
					break;
				case 2:
					taskProps.title = translate( 'Your photo looks great!' );
					taskProps.buttonText = translate( 'Next task' );
					taskProps.dismissButtonText = translate( 'View all tasks' );
					taskProps.onClick = this.handleInlineHelpNext;
					taskProps.onDismiss = this.backToChecklist;
					taskProps.duration = null;
					taskProps.autoCloseOnAction = true;
					break;
			}
		}

		return <TaskComponent { ...taskProps } />;
	};

	renderBusinessHoursAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Add business hours' ) }
				description={ translate(
					'Let your customers know when you’re open or the best time to contact you.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 8, args: [ 8 ] } ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderServiceListAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Add a list of services' ) }
				description={ translate(
					'Let potential customers and clients know what you have to offer.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 8, args: [ 8 ] } ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderStaffInfoAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, siteVerticals } = this.props;
		let staff = translate( 'staff' );

		if ( includes( siteVerticals, 'Health & Medical' ) ) {
			staff = translate( 'doctors', { context: 'Health & Medical' } );
		} else if ( includes( siteVerticals, 'Educations' ) ) {
			staff = translate( 'educators', { context: 'Educations' } );
		} else if ( includes( siteVerticals, 'Fitness & Excercise' ) ) {
			staff = translate( 'professionals', { context: 'Fitness & Excercise' } );
		}

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Add info about your %(staff)s', { args: { staff } } ) }
				description={ translate(
					'Customers love to learn about who they’re going to interact with if they contact you. ' +
						'Give them your best.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderProductListAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Add a list of your products and services' ) }
				description={ translate(
					'Let visitors know what you do best and what you have to offer.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderMenuAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Add your menu' ) }
				description={ translate(
					'Upload your menu so customers know what to expect when they stop in.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderPortfolioItemAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Add a portfolio item' ) }
				description={ translate(
					'You do great work. Show it off to attract new clients or highlight pieces you’re proud of.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderMissionStatementAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Add your mission statement' ) }
				description={ translate(
					'Inspire visitors by adding a mission statement to your homepage.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 5, args: [ 5 ] } ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderQualificationsAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				title={ translate( 'Add your qualifications' ) }
				description={ translate(
					'Instill confidence and trust by telling people why you’re qualified to help them.'
				) }
				duration={ translate( '%d minute', '%d minutes', { count: 8, args: [ 8 ] } ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};
}

function getContactPage( posts ) {
	return get(
		find(
			posts,
			post =>
				post.type === 'page' &&
				( some( post.metadata, { key: '_headstart_post', value: '_hs_contact_page' } ) ||
					post.slug === 'contact' )
		),
		'ID',
		null
	);
}

function getPageEditorUrl( state, siteId, pageId ) {
	if ( ! pageId ) {
		return null;
	}

	return getEditorUrl( state, siteId, pageId, 'page' );
}

const getTaskUrls = createSelector(
	( state, siteId ) => {
		const posts = getPostsForQuery( state, siteId, FIRST_TEN_SITE_POSTS_QUERY );
		const firstPostID = get( find( posts, { type: 'post' } ), [ 0, 'ID' ] );
		const contactPageUrl = getPageEditorUrl( state, siteId, getContactPage( posts ) );
		const frontPageUrl = getPageEditorUrl( state, siteId, getSiteFrontPage( state, siteId ) );

		return {
			post_published: getPageEditorUrl( state, siteId, firstPostID ),
			contact_page_updated: contactPageUrl,
			about_text_updated: frontPageUrl,
			homepage_photo_updated: frontPageUrl,
		};
	},
	( state, siteId ) => [ getPostsForQuery( state, siteId, FIRST_TEN_SITE_POSTS_QUERY ) ]
);

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const siteChecklist = getSiteChecklist( state, siteId );
		const user = getCurrentUser( state );
		const taskUrls = getTaskUrls( state, siteId );

		return {
			designType: getSiteOption( state, siteId, 'design_type' ),
			siteId,
			siteSlug,
			siteSegment: get( siteChecklist, 'segment' ),
			siteVerticals: get( siteChecklist, 'verticals' ),
			taskStatuses: get( siteChecklist, 'tasks' ),
			taskUrls,
			taskStep: getChecklistPromptStep( state ),
			userEmail: ( user && user.email ) || '',
			needsVerification: ! isCurrentUserEmailVerified( state ),
			isSiteUnlaunched: isUnlaunchedSite( state, siteId ),
			domains: getDomainsBySiteId( state, siteId ),
			currentRoute: getCurrentRoute( state ),
		};
	},
	{
		createNotice,
		recordTracksEvent,
		requestGuidedTour,
		requestSiteChecklistTaskUpdate,
		launchSite,
		showInlineHelpPopover,
		showChecklistPrompt,
		setChecklistPromptTaskId,
		setChecklistPromptStep,
	}
)( localize( WpcomChecklistComponent ) );
