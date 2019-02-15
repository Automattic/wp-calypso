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
import { successNotice } from 'state/notices/actions';
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
import getEditorUrl from 'state/selectors/get-editor-url';

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
			this.props.successNotice( 'You completed a task!', { duration: 5000 } );
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

	handleInlineHelpStart = task => () => {
		if ( task.isCompleted ) {
			return;
		}

		this.props.setChecklistPromptTaskId( task.id );
		this.props.setChecklistPromptStep( 0 );
		this.props.showInlineHelpPopover();
		this.props.showChecklistPrompt();
	};

	nextInlineHelp = () => {
		const taskList = getTaskList( this.props );
		const firstIncomplete = taskList.getFirstIncompleteTask();

		if ( firstIncomplete ) {
			this.props.setChecklistPromptTaskId( firstIncomplete.id );
			this.props.setChecklistPromptStep( 0 );
		} else {
			this.props.setChecklistPromptTaskId( null );
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
						page( `/email/${ siteSlug }` );
					},
					onDismiss: this.handleTaskDismiss( task.id ),
			  };

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/email.svg"
				title={ translate( 'Get email for your site' ) }
				completedTitle={ translate( 'You set up email for your site' ) }
				description={ translate(
					'Subscribe to G Suite to get a dedicated inbox with a personalized email address using your domain and collaborate in real-time on documents, spreadsheets, and slides.'
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
				bannerImageSrc="/calypso/images/stats/tasks/email.svg"
				title={ translate( 'Get email for your site' ) }
				completedTitle={ translate( 'You set up email forwarding for your site' ) }
				completedDescription={ translate(
					'Want a dedicated inbox, docs, and cloud storage? {{link}}Upgrade to G Suite!{{/link}}',
					{
						components: {
							link: (
								<a
									onClick={ () => this.trackTaskStart( task, { clicked_element: 'hyperlink' } ) }
									href={ `/email/${ siteSlug }` }
								/>
							),
						},
					}
				) }
				completedButtonText={ translate( 'Upgrade' ) }
				onClick={ () => {
					this.trackTaskStart( task, { clicked_element: 'button' } );
					page( `/email/${ siteSlug }` );
				} }
				onDismiss={ this.handleTaskDismiss( task.id ) }
			/>
		);
	};

	renderGSuiteTOSAcceptedTask = ( TaskComponent, baseProps, task ) => {
		const { domains, translate, userEmail } = this.props;

		let loginUrlWithTOSRedirect;
		if ( Array.isArray( domains ) && domains.length > 0 ) {
			const domainName = domains[ 0 ].name;
			const users = domains[ 0 ].googleAppsSubscription.pendingUsers;
			loginUrlWithTOSRedirect = getLoginUrlWithTOSRedirect( users[ 0 ], domainName );
		}

		return (
			<TaskComponent
				{ ...baseProps }
				bannerImageSrc="/calypso/images/stats/tasks/email.svg"
				title={ translate( 'You set up email for your site' ) }
				description={ translate(
					"{{strong}}You're almost done!{{/strong}} We've sent an email to %s. Log in and accept Google's Terms of Service to activate your G Suite account. {{link}}Didn't receive the email?{{/link}}",
					{
						components: {
							strong: <strong />,
							link: (
								<a
									onClick={ () =>
										this.trackTaskStart( task, {
											sub_step_name: 'gsuite_tos_accepted',
											clicked_element: 'no_email_help_link',
										} )
									}
									href={ `/help/contact` }
								/>
							),
						},
						args: [ userEmail ],
					}
				) }
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
		const { translate, taskUrls } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				preset="update-homepage"
				title={ translate( 'Edit About text' ) }
				description={ translate(
					'Update the text we’ve written for you to describe what makes your business unique. ' +
						'Make your homepage speak to your customers.'
				) }
				steps={ [
					{
						title: translate( 'Update your homepage text' ),
						description: translate(
							'Take a moment to review what we’ve written for you. ' +
								'Click the text to make any additions or changes.'
						),
					},
					{
						title: translate( 'Homepage updated!' ),
						description: translate(
							'Nide work. If all the text looks good, ' + 'let’s move on to changing your photos.'
						),
					},
				] }
				duration={ translate( '%d minute', '%d minutes', { count: 5, args: [ 5 ] } ) }
				targetUrl={ taskUrls[ task.id ] }
				onClick={ this.handleInlineHelpStart( task ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				backToChecklist={ this.backToChecklist }
				nextInlineHelp={ this.nextInlineHelp }
			/>
		);
	};

	renderHomepagePhotoUpdatedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, taskUrls } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				preset="update-homepage"
				title={ translate( 'Change homepage photo' ) }
				description={ translate(
					'Upload your own photo or choose from a wide selection of free ones to personalize your new site.'
				) }
				steps={ [
					{
						title: translate( 'Upload a photo or choose a new one from ours' ),
						description: translate(
							'Make a good first impression. ' +
								'Change your cover photo by uploading your own or choose from a selection of free ones.'
						),
					},
					{
						title: translate( 'Your photo looks great!' ),
						description: translate(
							'Go ahead and change any other photos to further personalize your site. ' +
								'When you’re ready, let’s continue.'
						),
					},
				] }
				duration={ translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ) }
				targetUrl={ taskUrls[ task.id ] }
				onClick={ this.handleInlineHelpStart( task ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				backToChecklist={ this.backToChecklist }
				nextInlineHelp={ this.nextInlineHelp }
			/>
		);
	};

	renderBusinessHoursAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, taskUrls } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				preset="update-homepage"
				title={ translate( 'Add business hours' ) }
				description={ translate(
					'Let your customers know when you’re open or the best time to contact you.'
				) }
				steps={ [
					{
						title: translate( 'Add business hours to your homepage' ),
						description: translate(
							'Customers love to easily know when they can stop in. ' +
								'Click the business hours block to add your hours.'
						),
					},
					{
						title: translate( 'Business hours saved!' ),
						description: translate( 'Your site is really looking great now.' ),
					},
				] }
				duration={ translate( '%d minute', '%d minutes', { count: 8, args: [ 8 ] } ) }
				targetUrl={ taskUrls[ task.id ] }
				onClick={ this.handleInlineHelpStart( task ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				backToChecklist={ this.backToChecklist }
				nextInlineHelp={ this.nextInlineHelp }
			/>
		);
	};

	renderServiceListAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, taskUrls } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				preset="update-homepage"
				title={ translate( 'Add your services' ) }
				description={ translate( 'Let customers and clients know how you can help them.' ) }
				steps={ [
					{
						title: translate( 'Add services to your homepage' ),
						description: translate(
							'Customers are more likely to contact you if they know what you have to offer. ' +
								'Click the services block to add your list of services.'
						),
					},
					{
						title: translate( 'Services added!' ),
						description: translate( 'Ready to move on?' ),
					},
				] }
				duration={ translate( '%d minute', '%d minutes', { count: 5, args: [ 5 ] } ) }
				targetUrl={ taskUrls[ task.id ] }
				onClick={ this.handleInlineHelpStart( task ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				backToChecklist={ this.backToChecklist }
				nextInlineHelp={ this.nextInlineHelp }
			/>
		);
	};

	renderStaffInfoAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, taskUrls, siteVerticals } = this.props;
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
				preset="update-homepage"
				title={ translate( 'Add info about your %(staff)s', { args: { staff } } ) }
				description={ translate(
					'Customers love to learn about who they’re going to interact with if they contact you.'
				) }
				steps={ [
					{
						title: translate( 'Add staff to your homepage' ),
						description: translate(
							'Help customers trust you by telling them about your qualifications.' +
								'Click the services block to add your list of services.'
						),
					},
					{
						title: translate( 'Services added!' ),
						description: translate( 'Ready to move on?' ),
					},
				] }
				duration={ translate( '%d minute', '%d minutes', { count: 5, args: [ 5 ] } ) }
				targetUrl={ taskUrls[ task.id ] }
				onClick={ this.handleInlineHelpStart( task ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				backToChecklist={ this.backToChecklist }
				nextInlineHelp={ this.nextInlineHelp }
			/>
		);
	};

	renderProductListAddedTask = ( TaskComponent, baseProps, task ) => {
		const { translate, taskUrls } = this.props;

		return (
			<TaskComponent
				{ ...baseProps }
				preset="update-homepage"
				title={ translate( 'Add products and services' ) }
				description={ translate(
					'Let visitors know what you do best and what you have to offer.'
				) }
				steps={ [
					{
						title: translate( 'Add products to your homepage' ),
						description: translate(
							'Customers are more likely to contact you if they know what you have to offer. ' +
								'Add products and services to your homepage.'
						),
					},
					{
						title: translate( 'Homepage saved!' ),
						description: translate( 'Ready to move on?' ),
					},
				] }
				duration={ translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ) }
				targetUrl={ taskUrls[ task.id ] }
				onClick={ this.handleInlineHelpStart( task ) }
				onDismiss={ this.handleTaskDismiss( task.id ) }
				backToChecklist={ this.backToChecklist }
				nextInlineHelp={ this.nextInlineHelp }
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
			business_hours_added: frontPageUrl,
			service_list_added: frontPageUrl,
			staff_info_added: frontPageUrl,
			product_list_added: frontPageUrl,
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
			userEmail: ( user && user.email ) || '',
			needsVerification: ! isCurrentUserEmailVerified( state ),
			isSiteUnlaunched: isUnlaunchedSite( state, siteId ),
			domains: getDomainsBySiteId( state, siteId ),
		};
	},
	{
		successNotice,
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
