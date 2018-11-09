/** @format */
/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compact, find, get, some, memoize } from 'lodash';
import { isDesktop } from 'lib/viewport';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import WpcomTaskList from './wpcom-task-list';
import Checklist from 'components/checklist';
import ChecklistBanner from './checklist-banner';
import ChecklistBannerTask from './checklist-banner/task';
import ChecklistNavigation from './checklist-navigation';
import ChecklistNotification from './checklist-notification';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import QueryPosts from 'components/data/query-posts';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import Task from 'components/checklist/task';
import { createNotice } from 'state/notices/actions';
import { getPostsForQuery } from 'state/posts/selectors';
import { getSelectedSiteId, isSiteSection } from 'state/ui/selectors';
import { getSiteOption, getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import userFactory from 'lib/user';

const userLib = userFactory();

const query = { type: 'any', number: 10, order_by: 'ID', order: 'ASC' };

const getTaskList = memoize(
	( taskStatuses, designType ) => new WpcomTaskList( taskStatuses, { designType } )
);

class WpcomChecklist extends PureComponent {
	static propTypes = {
		createNotice: PropTypes.func.isRequired,
		designType: PropTypes.oneOf( [ 'blog', 'page', 'portfolio' ] ),
		recordTracksEvent: PropTypes.func.isRequired,
		requestGuidedTour: PropTypes.func.isRequired,
		requestSiteChecklistTaskUpdate: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		taskStatuses: PropTypes.object,
		viewMode: PropTypes.oneOf( [ 'checklist', 'banner', 'navigation', 'notification' ] ),
	};

	static defaultProps = {
		viewMode: 'checklist',
	};

	state = {
		pendingRequest: false,
		emailSent: false,
		error: null,
	};

	canShow = () => {
		if ( ! this.props.isEligibleForDotcomChecklist || ! this.props.isSiteSection ) {
			return false;
		}

		return true;
	};

	handleTaskStart = ( { task, tourId, url } ) => () => {
		if ( ! tourId && ! url ) {
			return;
		}

		const location = 'banner' === this.props.viewMode ? 'checklist_banner' : 'checklist_show';

		this.props.recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'new_blog',
			location,
			step_name: task.id,
		} );

		if ( tourId && ! task.isCompleted && isDesktop() ) {
			this.props.requestGuidedTour( tourId );
		}

		if ( url ) {
			page.show( url );
		}
	};

	handleTaskDismiss = taskId => () => {
		const { siteId } = this.props;

		if ( taskId ) {
			this.props.createNotice( 'is-success', 'You completed a task!' );
			this.props.requestSiteChecklistTaskUpdate( siteId, taskId );
		}
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
		const {
			designType,
			siteId,
			taskStatuses,
			viewMode,
			updateCompletion,
			setNotification,
			setStoredTask,
			closePopover,
			showNotification,
			storedTask,
		} = this.props;

		const canShowChecklist = this.canShow();
		const taskList = getTaskList( taskStatuses, designType );

		let ChecklistComponent = Checklist;

		switch ( viewMode ) {
			case 'banner':
				ChecklistComponent = ChecklistBanner;
				break;
			case 'navigation':
				ChecklistComponent = ChecklistNavigation;
				break;
			case 'notification':
				ChecklistComponent = ChecklistNotification;
				break;
		}

		return (
			<>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ siteId && <QueryPosts siteId={ siteId } query={ query } /> }
				<ChecklistComponent
					isPlaceholder={ ! taskStatuses }
					updateCompletion={ updateCompletion }
					canShowChecklist={ canShowChecklist }
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

	renderTask( task ) {
		const { siteSlug, viewMode } = this.props;
		const TaskComponent = 'banner' === viewMode ? ChecklistBannerTask : Task;

		const taskFunctions = {
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
		};

		const baseProps = {
			id: task.id,
			key: task.id,
			completed: task.isCompleted,
			siteSlug,
		};

		if ( taskFunctions[ task.id ] ) {
			return taskFunctions[ task.id ]( TaskComponent, baseProps, task );
		}

		return null;
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

		// Hide this task when we can't find the exact URL of the page.
		if ( ! taskUrls.contact_page_updated ) {
			return null;
		}

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
}

function getContactPage( posts ) {
	return find(
		posts,
		post =>
			post.type === 'page' &&
			( some( post.metadata, { key: '_headstart_post', value: '_hs_contact_page' } ) ||
				post.slug === 'contact' )
	);
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );

		const posts = getPostsForQuery( state, siteId, query );

		const firstPost = find( posts, { type: 'post' } );
		const contactPageID = get( getContactPage( posts ), 'ID', null );
		const contactPageUrl = contactPageID && `/page/${ siteSlug }/${ contactPageID }`;

		const user = getCurrentUser( state );

		const taskUrls = {
			post_published: compact( [ '/post', siteSlug, get( firstPost, [ 'ID' ] ) ] ).join( '/' ),
			contact_page_updated: contactPageUrl,
		};

		return {
			designType: getSiteOption( state, siteId, 'design_type' ),
			isEligibleForDotcomChecklist: isEligibleForDotcomChecklist( state, siteId ),
			isSiteSection: isSiteSection( state ),
			siteId,
			siteSlug,
			taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
			taskUrls,
			userEmail: ( user && user.email ) || '',
			needsVerification: ! isCurrentUserEmailVerified( state ),
		};
	},
	{
		createNotice,
		recordTracksEvent,
		requestGuidedTour,
		requestSiteChecklistTaskUpdate,
	}
)( localize( WpcomChecklist ) );
