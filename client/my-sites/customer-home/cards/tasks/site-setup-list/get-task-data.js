/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { domainManagementEdit, domainManagementList } from 'my-sites/domains/paths';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'state/sites/launch/actions';
import { localizeUrl } from 'lib/i18n-utils';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';

export const getTaskData = ( task, { menusUrl, siteId, siteSlug, taskUrls, userEmail } = {} ) => {
	let taskData = {};
	switch ( task.id ) {
		case 'domain_verified':
			taskData = {
				todo: {
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
				},
				completed: {
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
				},
			};
			break;
		case 'email_verified':
			taskData = {
				todo: {
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
				},
				completed: {},
			};
			break;
		case 'blogname_set':
			taskData = {
				todo: {
					timing: 1,
					title: translate( 'Name your site' ),
					description: translate(
						'Give your new site a title to let people know what your site is about. A good title introduces your brand and the primary topics of your site.'
					),
					actionText: translate( 'Name your site' ),
					actionUrl: `/settings/general/${ siteSlug }`,
					tour: 'checklistSiteTitle',
				},
				completed: {},
			};
			break;
		case 'mobile_app_installed':
			taskData = {
				todo: {
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
				},
				completed: {
					title: translate( 'You downloaded the WordPress app' ),
					description: translate( 'You can re-download the app at any time.' ),
					actionText: translate( 'Re-download mobile app' ),
					actionUrl: '/me/get-apps',
					...( ! task.isCompleted && {
						actionDispatch: requestSiteChecklistTaskUpdate,
						actionDispatchArgs: [ siteId, task.id ],
					} ),
				},
			};
			break;
		case 'site_launched':
			taskData = {
				todo: {
					timing: 1,
					title: translate( 'Launch your site' ),
					description: translate(
						"Your site is private and only visible to you. When you're ready, launch your site to make it public."
					),
					actionText: translate( 'Launch site' ),
					actionDispatch: launchSiteOrRedirectToLaunchSignupFlow,
					actionDispatchArgs: [ siteId ],
				},
				completed: {},
			};
			break;
		case 'front_page_updated':
			taskData = {
				todo: {
					timing: 20,
					title: translate( 'Update your Home page' ),
					description: translate(
						"We've created the basics, now it's time for you to update the images and text. Make a great first impression. Everything you do can be changed anytime."
					),
					actionText: translate( 'Edit homepage' ),
				},
				completed: {},
			};
			break;
		case 'site_menu_updated':
			taskData = {
				todo: {
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
				},
				completed: {},
			};
			break;
	}
	return {
		...task,
		actionUrl: taskUrls[ task.id ],
		...taskData,
	};
};
