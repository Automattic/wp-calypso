/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'calypso/components/inline-support-link';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';
import { requestSiteChecklistTaskUpdate } from 'calypso/state/checklist/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { verifyEmail } from 'calypso/state/current-user/email-verification/actions';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';

const getTaskDescription = ( task, { isDomainUnverified, isEmailUnverified } ) => {
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
			if ( isEmailUnverified ) {
				return (
					<>
						{ task.description }
						<br />
						<br />
						{ translate( 'Confirm your email address before launching your site.' ) }
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
			return isDomainUnverified || isEmailUnverified;
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
		isPodcastingSite,
		menusUrl,
		siteId,
		siteSlug,
		taskUrls,
		userEmail,
	} = {}
) => {
	let taskData = {};
	switch ( task.id ) {
		case CHECKLIST_KNOWN_TASKS.START_SITE_SETUP:
			taskData = isPodcastingSite
				? {
						title: translate( 'Welcome to your podcast site!' ),
						label: translate( 'Continue building your site' ),
						description: translate(
							"Now that you've created your site, we'll guide you through completing a few additional steps to finish building your site."
						),
						isSkippable: true,
						isSkippableText: translate( 'Dismiss' ),
						actionText: translate( 'Continue' ),
				  }
				: {
						timing: 1,
						label: translate( 'Site created' ),
						title: translate( 'Your site has been created!' ),
						description: translate(
							"Next, we'll guide you through setting up and launching your site."
						),
						actionText: translate( 'Get started' ),
						...( ! task.isCompleted && {
							actionDispatch: requestSiteChecklistTaskUpdate,
							actionDispatchArgs: [ siteId, task.id ],
						} ),
						actionAdvanceToNext: true,
						completeOnView: true,
				  };
			break;
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
				title: translate( 'Name your site' ),
				description: translate(
					'Give your new site a title to let people know what your site is about. A good title introduces your brand and the primary topics of your site.'
				),
				actionText: translate( 'Name your site' ),
				actionUrl: `/settings/general/${ siteSlug }`,
				tour: 'checklistSiteTitle',
			};
			break;
		case CHECKLIST_KNOWN_TASKS.MOBILE_APP_INSTALLED:
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
		case CHECKLIST_KNOWN_TASKS.PODCAST_SITE_LAUNCHED:
			taskData = {
				title: translate( 'Welcome to your podcast site!' ),
				label: translate( 'Continue building your site' ),
				description: translate(
					"Now that you've created your site, we'll guide you through completing a few additional steps to finish building your site."
				),
				isSkippable: true,
				isSkippableText: translate( 'Dismiss' ),
				actionText: translate( 'Continue' ),
			};
			break;
		case CHECKLIST_KNOWN_TASKS.SITE_LAUNCHED:
			taskData = {
				timing: 1,
				title: translate( 'Launch your site' ),
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
				title: translate( 'Update your Home page' ),
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
				title: translate( 'Create a site menu' ),
				description: (
					<>
						{ translate(
							"Building an effective navigation menu makes it easier for someone to find what they're looking for and improve search engine rankings."
						) }{ ' ' }
						<InlineSupportLink
							supportPostId={ 59580 }
							supportLink={ localizeUrl( 'https://wordpress.com/support/menus/' ) }
							showIcon={ false }
							tracksEvent="calypso_customer_home_menus_support_page_view"
							statsGroup="calypso_customer_home"
							statsName="menus_view_tutorial"
						>
							{ translate( 'View tutorial.' ) }
						</InlineSupportLink>
					</>
				),
				actionText: translate( 'Add a menu' ),
				isSkippable: true,
				actionUrl: menusUrl,
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
