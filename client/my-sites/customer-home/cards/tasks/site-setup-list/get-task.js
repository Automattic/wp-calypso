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
				title: translate( 'Confirm your email address' ),
				description: translate(
					'Please click the link in the email we sent to %(email)s. ' +
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
				actionText: translate( 'Resend email' ),
				actionDispatch: verifyEmail,
				actionDispatchArgs: [ { showGlobalNotices: true } ],
			};
			break;
		case CHECKLIST_KNOWN_TASKS.BLOGNAME_SET:
			taskData = {
				timing: 1,
				title: translate( 'Give your site a name' ),
				description: translate(
					'Give your new site a title to let people know what your site is about.'
				),
				actionText: translate( 'Name your site' ),
				actionUrl: `/settings/general/${ siteSlug }`,
				tour: 'checklistSiteTitle',
			};
			break;
		case CHECKLIST_KNOWN_TASKS.MOBILE_APP_INSTALLED:
			taskData = {
				timing: 3,
				title: translate( 'Try the WordPress app' ),
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
				title: translate( 'Launch your site to the world' ),
				description: translate(
					"Your site is private and only visible to you. When you're ready, launch your site to make it public."
				),
				actionText: translate( 'Launch site' ),
				actionDispatch: launchSiteOrRedirectToLaunchSignupFlow,
				actionDispatchArgs: [ siteId ],
				actionDisableOnComplete: true,
			};
			break;
		case CHECKLIST_KNOWN_TASKS.FRONT_PAGE_UPDATED:
			taskData = {
				timing: 20,
				title: translate( 'Update your homepage' ),
				description: translate(
					"We've created the basics, now it's time for you to update the images and text. Make a great first impression. Everything you do can be changed anytime."
				),
				actionText: translate( 'Edit homepage' ),
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
