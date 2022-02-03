import { translate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';
import { emailManagementTitanSetUpMailbox } from 'calypso/my-sites/email/paths';
import { requestSiteChecklistTaskUpdate } from 'calypso/state/checklist/actions';
import { verifyEmail } from 'calypso/state/current-user/email-verification/actions';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';

const getTaskDescription = ( task, { isDomainUnverified } ) => {
	switch ( task.id ) {
		case CHECKLIST_KNOWN_TASKS.SITE_LAUNCHED:
			if ( isDomainUnverified ) {
				return (
					<>
						{ task.description }
						<br />
						<br />
						{ translate( 'Verify the email address for your domain before launching your site.' ) }
					</>
				);
			}
			return task.description;
		default:
			return task.description;
	}
};

const isTaskDisabled = (
	task,
	{ emailVerificationStatus, isDomainUnverified, isEmailUnverified }
) => {
	switch ( task.id ) {
		case CHECKLIST_KNOWN_TASKS.EMAIL_VERIFIED:
			return 'requesting' === emailVerificationStatus || ! isEmailUnverified;
		case CHECKLIST_KNOWN_TASKS.SITE_LAUNCHED:
			return isDomainUnverified;
		case CHECKLIST_KNOWN_TASKS.PROFESSIONAL_EMAIL_MAILBOX_CREATED:
			return task.isCompleted;
		default:
			return false;
	}
};

export const getTask = (
	task,
	{
		emailVerificationStatus,
		isDomainUnverified,
		isEmailUnverified,
		menusUrl,
		siteId,
		siteSlug,
		taskUrls,
		userEmail,
		isBlogger,
		isFSEActive,
	} = {}
) => {
	let taskData = {};
	switch ( task.id ) {
		case CHECKLIST_KNOWN_TASKS.DOMAIN_VERIFIED:
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
		case CHECKLIST_KNOWN_TASKS.EMAIL_VERIFIED:
			taskData = {
				timing: 1,
				title: (
					<>
						{ translate( 'Confirm your email address' ) }
						<span className="site-setup-list__nav-item-email">{ userEmail }</span>
					</>
				),
				description: (
					<>
						{ translate(
							'We have sent an email to this address to verify your account. Not in inbox or spam folder? Tap the Resend email button! '
						) }
						<span className="site-setup-list__task-description-email"> { userEmail } </span>
						<a href="/me/account">{ translate( 'Change' ) }</a>
					</>
				),
				actionText: translate( 'Resend email' ),
				actionDispatch: verifyEmail,
				actionDispatchArgs: [ { showGlobalNotices: true } ],
			};
			break;
		case CHECKLIST_KNOWN_TASKS.BLOGNAME_SET:
			taskData = {
				timing: 1,
				title: isBlogger ? translate( 'Name your blog' ) : translate( 'Give your site a name' ),
				description: isBlogger
					? translate(
							"Choose a name for your blog that reflects your site's personality. Don't worry, you can change it any time you like."
					  )
					: translate( 'Give your new site a title to let people know what your site is about.' ),
				actionText: isBlogger ? translate( 'Name your blog' ) : translate( 'Name your site' ),
				actionUrl: `/settings/general/${ siteSlug }`,
				tour: 'checklistSiteTitle',
			};
			break;
		case CHECKLIST_KNOWN_TASKS.MOBILE_APP_INSTALLED:
			taskData = {
				timing: 3,
				title: translate( 'Try the WordPress app' ),
				description: isBlogger
					? translate( 'Write posts, check stats, and reply to comments on the go!' )
					: translate(
							'Download the WordPress app to your mobile device to manage your site and follow your stats on the go.'
					  ),
				actionText: isBlogger
					? translate( 'Download the app' )
					: translate( 'Download mobile app' ),
				actionUrl: '/me/get-apps',
				...( ! task.isCompleted && {
					actionDispatch: requestSiteChecklistTaskUpdate,
					actionDispatchArgs: [ siteId, task.id ],
				} ),
				isSkippable: true,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.WOOCOMMERCE_SETUP:
			taskData = {
				timing: 7,
				title: translate( 'Finish store setup' ),
				description: translate(
					'Add your store details, add products, configure shipping, so you can begin to collect orders!'
				),
				actionText: task.isCompleted
					? translate( 'Go to WooCommerce Home' )
					: translate( 'Finish store setup' ),
				actionUrl: taskUrls?.woocommerce_setup,
				actionDisableOnComplete: false,
				isSkippable: true,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.SITE_LAUNCHED:
			taskData = {
				timing: 1,
				title: isBlogger
					? translate( 'Launch your blog' )
					: translate( 'Launch your site to the world' ),
				description: isBlogger
					? translate(
							"Ready for the big reveal? Right now, your blog is private and visible only to you. Launch your blog so that it's public for everyone."
					  )
					: translate(
							"Your site is private and only visible to you. When you're ready, launch your site to make it public."
					  ),
				actionText: isBlogger ? translate( 'Launch blog' ) : translate( 'Launch site' ),
				actionDispatch: launchSiteOrRedirectToLaunchSignupFlow,
				actionDispatchArgs: [ siteId ],
				actionDisableOnComplete: true,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.FRONT_PAGE_UPDATED:
			taskData = {
				timing: 20,
				title: isFSEActive
					? translate( "Update your site's design" )
					: translate( 'Update your homepage' ),
				description: translate(
					"We've created the basics, now it's time for you to update the images and text. Make a great first impression. Everything you do can be changed anytime."
				),
				actionText: isFSEActive ? translate( 'Edit site' ) : translate( 'Edit homepage' ),
				actionUrl: taskUrls?.front_page_updated,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.SITE_MENU_UPDATED:
			taskData = {
				timing: 10,
				title: translate( 'Customize your site menu' ),
				description: translate(
					"Building an effective navigation menu makes it easier for someone to find what they're looking for and improve search engine rankings."
				),
				actionText: translate( 'Add a menu' ),
				actionUrl: menusUrl,
				actionIsLink: true,
				customFirstButton: (
					<InlineSupportLink
						// The following classes are globally shared
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						className="button is-primary task__action"
						supportContext="menus"
						showIcon={ false }
						tracksEvent="calypso_customer_home_menus_support_page_view"
						statsGroup="calypso_customer_home"
						statsName="menus_view_tutorial"
					>
						{ translate( 'View tutorial' ) }
					</InlineSupportLink>
				),
			};
			break;
		case CHECKLIST_KNOWN_TASKS.SITE_THEME_SELECTED:
			taskData = {
				timing: 5,
				title: translate( 'Choose a theme' ),
				description: translate(
					'Make your site uniquely yours! ' +
						'Themes don’t just change the look and feel of your site, they can also add new features such as a unique homepage layout, interactive post sliders, and more!'
				),
				actionText: translate( 'Choose a theme' ),
				isSkippable: false,
				actionUrl: `/themes/${ siteSlug }`,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.PROFESSIONAL_EMAIL_MAILBOX_CREATED:
			taskData = {
				timing: 2,
				title: translate( 'Set up your Professional Email' ),
				description: translate(
					'Complete your Professional Email setup to start sending and receiving emails from your custom domain today.'
				),
				actionText: translate( 'Set up mailbox' ),
				isSkippable: false,
				actionUrl: emailManagementTitanSetUpMailbox( siteSlug, task.domain ),
			};
			break;
		case CHECKLIST_KNOWN_TASKS.BLOG_PREVIEWED:
			taskData = {
				timing: 1,
				title: translate( 'Preview your blog' ),
				description: translate(
					"See how your site looks to site visitors. Remember, your blog is a work in progress — you can always choose a new theme or tweak your site's design."
				),
				actionText: translate( 'Preview blog' ),
				actionUrl: `/view/${ siteSlug }`,
				...( ! task.isCompleted && {
					actionDispatch: requestSiteChecklistTaskUpdate,
					actionDispatchArgs: [ siteId, task.id ],
				} ),
				isSkippable: true,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.THEMES_BROWSED:
			taskData = {
				timing: 2,
				title: translate( 'Browse themes' ),
				description: translate(
					"Choose the perfect look for your site — one that reflects your site's personality."
				),
				actionText: translate( 'Browse themes' ),
				actionUrl: `/themes/${ siteSlug }`,
				...( ! task.isCompleted && {
					actionDispatch: requestSiteChecklistTaskUpdate,
					actionDispatchArgs: [ siteId, task.id ],
				} ),
				isSkippable: true,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.FIRST_POST_PUBLISHED:
			taskData = {
				timing: 10,
				title: translate( 'Publish your first post' ),
				description: translate(
					"See how your site looks to site visitors. Remember, your blog is a work in progress — you can always choose a new theme or tweak your site's design."
				),
				actionText: translate( 'Draft a post' ),
				actionUrl: `/post/${ siteSlug }`,
				isSkippable: true,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.POST_SHARING_ENABLED:
			taskData = {
				timing: 5,
				title: translate( 'Enable post sharing' ),
				description: isBlogger
					? translate(
							'Enable post sharing to automatically share your new blog posts to Twitter, Facebook, or LinkedIn to ensure your audience will never miss an update.'
					  )
					: translate(
							'Enable post sharing to automatically share your new posts to Twitter, Facebook, or LinkedIn to ensure your audience will never miss an update.'
					  ),
				actionText: translate( 'Enable sharing' ),
				actionUrl: `/marketing/connections/${ siteSlug }`,
				isSkippable: true,
			};
			break;
	}

	const enhancedTask = {
		...task,
		...taskData,
	};

	return {
		...enhancedTask,
		description: getTaskDescription( enhancedTask, { isDomainUnverified, isEmailUnverified } ),
		isDisabled: isTaskDisabled( enhancedTask, {
			emailVerificationStatus,
			isDomainUnverified,
			isEmailUnverified,
		} ),
	};
};
