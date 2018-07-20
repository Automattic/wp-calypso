/** @format */
/**
 * External dependencies
 */
import page from 'page';
import { isDesktop } from 'lib/viewport';
import { translate } from 'i18n-calypso';

export const tasks = [
	{
		id: 'site_created',
		title: translate( 'Create your site' ),
		description: translate( 'This is where your adventure begins.' ),
		completedTitle: translate( 'You created your site' ),
		completed: true,
	},
	{
		id: 'domain_selected',
		title: translate( 'Pick a website address' ),
		description: translate( 'Choose an address so people can find you on the internet.' ),
		completedTitle: translate( 'You picked a website address' ),
		completed: true,
		image: '/calypso/images/stats/tasks/domains.svg',
	},
	{
		id: 'blogname_set',
		title: translate( 'Give your site a name' ),
		description: translate( 'Give your site a descriptive name to entice visitors.' ),
		duration: translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ),
		completedTitle: translate( 'You updated your site title' ),
		completedButtonText: translate( 'Edit' ),
		tourUrl: '/settings/general/$siteSlug',
		image: '/calypso/images/stats/tasks/personalize-your-site.svg',
		tourSlug: 'checklistSiteTitle',
	},
	{
		id: 'site_icon_set',
		title: translate( 'Upload a site icon' ),
		description: translate(
			'Help people recognize your site in browser tabs — just like the WordPress.com W!'
		),
		duration: translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ),
		completedTitle: translate( 'You uploaded a site icon' ),
		completedButtonText: translate( 'Change' ),
		tourUrl: '/settings/general/$siteSlug',
		image: '/calypso/images/stats/tasks/upload-icon.svg',
		tourSlug: 'checklistSiteIcon',
	},
	{
		id: 'blogdescription_set',
		title: translate( 'Create a tagline' ),
		description: translate( 'Pique readers’ interest with a little more detail about your site.' ),
		duration: translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ),
		completedTitle: translate( 'You created a tagline' ),
		completedButtonText: translate( 'Change' ),
		tourUrl: '/settings/general/$siteSlug',
		image: '/calypso/images/stats/tasks/create-tagline.svg',
		tourSlug: 'checklistSiteTagline',
	},
	{
		id: 'avatar_uploaded',
		title: translate( 'Upload your profile picture' ),
		description: translate(
			'Who’s the person behind the site? Personalize your posts and comments with a custom profile picture.'
		),
		duration: translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ),
		completedTitle: translate( 'You uploaded a profile picture' ),
		completedButtonText: translate( 'Change' ),
		tourUrl: '/me',
		image: '/calypso/images/stats/tasks/upload-profile-picture.svg',
		tourSlug: 'checklistUserAvatar',
	},
	{
		id: 'contact_page_updated',
		title: translate( 'Personalize your Contact page' ),
		description: translate(
			'Encourage visitors to get in touch — a website is for connecting with people.'
		),
		duration: translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ),
		completedTitle: translate( 'You updated your Contact page' ),
		completedButtonText: translate( 'Edit' ),
		image: '/calypso/images/stats/tasks/contact.svg',
		tourUrl: '/post/$siteSlug/2',
		tourSlug: 'checklistContactPage',
	},
	{
		id: 'post_published',
		title: translate( 'Publish your first blog post' ),
		description: translate( 'Introduce yourself to the world! That’s why you’re here.' ),
		duration: translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ),
		completedTitle: translate( 'You published your first blog post' ),
		completedButtonText: translate( 'Edit' ),
		tourUrl: '/post/$siteSlug',
		image: '/calypso/images/stats/tasks/first-post.svg',
		tourSlug: 'checklistPublishPost',
	},
	{
		id: 'custom_domain_registered',
		title: translate( 'Register a custom domain' ),
		description: translate(
			'Memorable domain names make it easy for people to remember your address — and search engines love ’em.'
		),
		duration: translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ),
		completedTitle: translate( 'You registered a custom domain' ),
		completedButtonText: translate( 'Change' ),
		url: '/domains/add/$siteSlug',
		image: '/calypso/images/stats/tasks/custom-domain.svg',
		tour: 'checklistDomainRegister',
	},
];

export function launchTask( { task, location, requestTour, siteSlug, track } ) {
	const checklist_name = 'new_blog';
	const url = task.url && task.url.replace( '$siteSlug', siteSlug );
	const tour = task.tour;

	if ( task.completed ) {
		if ( url ) {
			page( url );
		}
		return;
	}

	if ( ! tour && ! url ) {
		return;
	}

	track( 'calypso_checklist_task_start', {
		checklist_name,
		step_name: task.id,
		location,
	} );

	if ( url ) {
		page( url );
	}

	if ( tour && isDesktop() ) {
		requestTour( tour );
	}
}
