/** @format */
/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compact, find, get, some } from 'lodash';
import { isDesktop } from 'lib/viewport';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
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

	isComplete( taskId ) {
		return get( this.props.taskStatuses, [ taskId, 'completed' ], false );
	}

	canShow = () => {
		if ( ! this.props.isEligibleForDotcomChecklist || ! this.props.isSiteSection ) {
			return false;
		}

		return true;
	};

	handleTaskStart = ( { taskId, tourId, url } ) => () => {
		if ( ! tourId && ! url ) {
			return;
		}

		const location = 'banner' === this.props.viewMode ? 'checklist_banner' : 'checklist_show';

		this.props.recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'new_blog',
			location,
			step_name: taskId,
		} );

		if ( tourId && ! this.isComplete( taskId ) && isDesktop() ) {
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

	handleTaskStartThenDismiss = arg => () => {
		this.handleTaskStart( arg )();
		this.handleTaskDismiss( arg.taskId )();
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
			siteSlug,
			taskStatuses,
			taskUrls,
			translate,
			viewMode,
			updateCompletion,
			setNotification,
			setStoredTask,
			closePopover,
			showNotification,
			storedTask,
		} = this.props;

		const canShowChecklist = this.canShow();
		const TaskComponent = 'banner' === viewMode ? ChecklistBannerTask : Task;

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
				>
					<TaskComponent
						bannerImageSrc="/calypso/images/illustrations/checkEmailsDesktop.svg"
						completed={ this.isComplete( 'email_verified' ) }
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
						siteSlug={ siteSlug }
						title={ translate( 'Confirm your email address' ) }
						buttonText={ this.verificationTaskButtonText() }
					/>
					<TaskComponent
						completed
						completedTitle={ translate( 'You created your site' ) }
						description={ translate( 'This is where your adventure begins.' ) }
						siteSlug={ siteSlug }
						title={ translate( 'Create your site' ) }
					/>
					<TaskComponent
						completed
						completedTitle={ translate( 'You picked a website address' ) }
						description={ translate( 'Choose an address so people can find you on the internet.' ) }
						siteSlug={ siteSlug }
						title={ translate( 'Pick a website address' ) }
					/>
					<TaskComponent
						bannerImageSrc="/calypso/images/stats/tasks/personalize-your-site.svg"
						completed={ this.isComplete( 'blogname_set' ) }
						completedButtonText={ translate( 'Edit' ) }
						completedTitle={ translate( 'You updated your site title' ) }
						description={ translate( 'Give your site a descriptive name to entice visitors.' ) }
						duration={ translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'blogname_set',
							tourId: 'checklistSiteTitle',
							url: `/settings/general/${ siteSlug }`,
						} ) }
						onDismiss={ this.handleTaskDismiss( 'blogname_set' ) }
						siteSlug={ siteSlug }
						title={ translate( 'Give your site a name' ) }
					/>
					<TaskComponent
						bannerImageSrc="/calypso/images/stats/tasks/upload-icon.svg"
						completed={ this.isComplete( 'site_icon_set' ) }
						completedButtonText={ translate( 'Change' ) }
						completedTitle={ translate( 'You uploaded a site icon' ) }
						description={ translate(
							'Help people recognize your site in browser tabs — just like the WordPress.com W!'
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'site_icon_set',
							tourId: 'checklistSiteIcon',
							url: `/settings/general/${ siteSlug }`,
						} ) }
						onDismiss={ this.handleTaskDismiss( 'site_icon_set' ) }
						siteSlug={ siteSlug }
						title={ translate( 'Upload a site icon' ) }
					/>
					<TaskComponent
						bannerImageSrc="/calypso/images/stats/tasks/create-tagline.svg"
						completed={ this.isComplete( 'blogdescription_set' ) }
						completedButtonText={ translate( 'Change' ) }
						completedTitle={ translate( 'You created a tagline' ) }
						description={ translate(
							'Pique readers’ interest with a little more detail about your site.'
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'blogdescription_set',
							tourId: 'checklistSiteTagline',
							url: `/settings/general/${ siteSlug }`,
						} ) }
						onDismiss={ this.handleTaskDismiss( 'blogdescription_set' ) }
						siteSlug={ siteSlug }
						title={ translate( 'Create a tagline' ) }
					/>

					{ 'blog' === designType && (
						<TaskComponent
							bannerImageSrc="/calypso/images/stats/tasks/upload-profile-picture.svg"
							completed={ this.isComplete( 'avatar_uploaded' ) }
							completedButtonText={ translate( 'Change' ) }
							completedTitle={ translate( 'You uploaded a profile picture' ) }
							description={ translate(
								'Who’s the person behind the site? Personalize your posts and comments with a custom profile picture.'
							) }
							duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
							onClick={ this.handleTaskStart( {
								taskId: 'avatar_uploaded',
								tourId: 'checklistUserAvatar',
								url: '/me',
							} ) }
							onDismiss={ this.handleTaskDismiss( 'avatar_uploaded' ) }
							siteSlug={ siteSlug }
							title={ translate( 'Upload your profile picture' ) }
						/>
					) }
					<TaskComponent
						bannerImageSrc="/calypso/images/stats/tasks/contact.svg"
						completed={ this.isComplete( 'contact_page_updated' ) }
						completedButtonText={ translate( 'Edit' ) }
						completedTitle={ translate( 'You updated your Contact page' ) }
						description={ translate(
							'Encourage visitors to get in touch — a website is for connecting with people.'
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'contact_page_updated',
							tourId: 'checklistContactPage',
							url: taskUrls.contact_page_updated,
						} ) }
						onDismiss={ this.handleTaskDismiss( 'contact_page_updated' ) }
						siteSlug={ siteSlug }
						title={ translate( 'Personalize your Contact page' ) }
					/>
					{ 'blog' === designType && (
						<TaskComponent
							bannerImageSrc="/calypso/images/stats/tasks/first-post.svg"
							completed={ this.isComplete( 'post_published' ) }
							completedButtonText={ translate( 'Edit' ) }
							completedTitle={ translate( 'You published your first blog post' ) }
							description={ translate(
								'Introduce yourself to the world! That’s why you’re here.'
							) }
							duration={ translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ) }
							onClick={ this.handleTaskStart( {
								taskId: 'post_published',
								tourId: 'checklistPublishPost',
								url: taskUrls.post_published,
							} ) }
							onDismiss={ this.handleTaskDismiss( 'post_published' ) }
							siteSlug={ siteSlug }
							title={ translate( 'Publish your first blog post' ) }
						/>
					) }
					<TaskComponent
						bannerImageSrc="/calypso/images/stats/tasks/custom-domain.svg"
						completed={ this.isComplete( 'custom_domain_registered' ) }
						completedButtonText={ translate( 'Change' ) }
						completedTitle={ translate( 'You registered a custom domain' ) }
						description={ translate(
							'Memorable domain names make it easy for people to remember your address — and search engines love ’em.'
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'custom_domain_registered',
							tourId: 'checklistDomainRegister',
							url: `/domains/add/${ siteSlug }`,
						} ) }
						onDismiss={ this.handleTaskDismiss( 'custom_domain_registered' ) }
						siteSlug={ siteSlug }
						title={ translate( 'Register a custom domain' ) }
					/>
					<TaskComponent
						bannerImageSrc="/calypso/images/stats/tasks/mobile-app.svg"
						completed={ this.isComplete( 'mobile_app_installed' ) }
						completedButtonText={ translate( 'Download' ) }
						completedTitle={ translate( 'You downloaded the WordPress app' ) }
						description={ translate(
							'Download the WordPress app to your mobile device to manage your site and follow your stats on the go.'
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
						onClick={ this.handleTaskStartThenDismiss( {
							taskId: 'mobile_app_installed',
							url: '/me/get-apps',
							dismiss: true,
						} ) }
						onDismiss={ this.handleTaskDismiss( 'mobile_app_installed' ) }
						title={ translate( 'Get the WordPress app' ) }
					/>
				</ChecklistComponent>
			</>
		);
	}
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
		const contactPage = getContactPage( posts );
		const contactPageUrl = contactPage
			? [ '/page', siteSlug, get( contactPage, [ 'ID' ] ) ].join( '/' )
			: `/pages/${ siteSlug }`;

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
