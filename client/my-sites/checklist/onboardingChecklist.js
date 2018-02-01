/**
 * External dependencies
 *
 * @format
 */
import page from 'page';
import { isDesktop } from 'lib/viewport';

/**
 * Internal dependencies
 */
const tasks = {
	about_page_updated: {
		title: 'Create your About page',
		description:
			'It’s the first place we all go! Don’t miss the opportunity to tell people more about you and your site.',
		duration: '10 mins',
		completedTitle: 'You updated your About page',
		completedButtonText: 'Change',
		image: '/calypso/images/stats/tasks/about.svg',
		url: '/pages/$siteSlug',
		tour: 'checklistAboutPage',
	},
	avatar_uploaded: {
		title: 'Upload your profile picture',
		description:
			'Who’s the person behind the site? Personalize your posts and comments with a custom profile picture.',
		duration: '2 mins',
		completedTitle: 'You uploaded a profile picture',
		completedButtonText: 'Change',
		url: '/me',
		image: '/calypso/images/stats/tasks/upload-profile-picture.svg',
		tour: 'checklistUserAvatar',
	},
	blogname_set: {
		title: 'Give your site a name',
		description: 'Give your site a descriptive name to entice visitors.',
		duration: '1 min',
		completedTitle: 'You updated your site title',
		completedButtonText: 'Edit',
		url: '/settings/general/$siteSlug',
		image: '/calypso/images/stats/tasks/personalize-your-site.svg',
		tour: 'checklistSiteTitle',
	},
	blogdescription_set: {
		title: 'Create a tagline',
		description: 'Pique readers’ interest with a little more detail about your site.',
		duration: '2 mins',
		completedTitle: 'You created a tagline',
		completedButtonText: 'Change',
		url: '/settings/general/$siteSlug',
		image: '/calypso/images/stats/tasks/create-tagline.svg',
		tour: 'checklistSiteTagline',
	},
	contact_page_updated: {
		title: 'Personalize your Contact page',
		description: 'Encourage visitors to get in touch — a website is for connecting with people.',
		duration: '2 mins',
		completedTitle: 'You updated your Contact page',
		completedButtonText: 'Edit',
		image: '/calypso/images/stats/tasks/contact.svg',
		url: '/post/$siteSlug/2',
		tour: 'checklistContactPage',
	},
	custom_domain_registered: {
		title: 'Register a custom domain',
		description:
			'Memorable domain names make it easy for people to remember your address — and search engines love ’em.',
		duration: '2 mins',
		completedTitle: 'You registered a custom domain',
		completedButtonText: 'Add email',
		url: '/domains/add/$siteSlug',
		image: '/calypso/images/stats/tasks/domains.svg',
	},
	domain_selected: {
		title: 'Pick a website address',
		description: 'Choose an address so people can find you on the internet.',
		completedTitle: 'You picked a website address',
		completed: true,
		image: '/calypso/images/stats/tasks/domains.svg',
	},
	post_published: {
		title: 'Publish your first blog post',
		description: 'Introduce yourself to the world! That’s why you’re here.',
		duration: '10 mins',
		completedTitle: 'You published your first blog post',
		completedButtonText: 'Edit',
		url: '/post/$siteSlug',
		image: '/calypso/images/stats/tasks/first-post.svg',
		tour: 'checklistPublishPost',
	},
	site_created: {
		title: 'Create your site',
		description: 'This is where your adventure begins.',
		completedTitle: 'You created your site',
		completed: true,
	},
	site_icon_set: {
		title: 'Upload a site icon',
		description: 'Help people recognize your site in browser tabs — just like the WordPress.com W!',
		duration: '1 min',
		completedTitle: 'You uploaded a site icon',
		completedButtonText: 'Change',
		url: '/settings/general/$siteSlug',
		image: '/calypso/images/stats/tasks/upload-icon.svg',
		tour: 'checklistSiteIcon',
	},
	social_links_set: {
		title: 'Display links to your social accounts',
		description: 'Let your audience know where else they can find you online.',
		duration: '2 mins',
		completedTitle: 'You added your social accounts.',
		completedButtonText: 'Change',
		url: '/customize/$siteSlug?guide=social-media',
		image: '/calypso/images/stats/tasks/social-links.svg',
	},
};

const sequence = [
	'site_created',
	'domain_selected',
	'blogname_set',
	'site_icon_set',
	'blogdescription_set',
	'avatar_uploaded',
	'contact_page_updated',
	'post_published',
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

export function onboardingTasks( checklist ) {
	if ( ! checklist || ! checklist.tasks ) {
		return null;
	}

	return sequence.map( id => {
		const task = tasks[ id ];
		const taskFromServer = checklist.tasks[ id ];

		return { id, ...task, ...taskFromServer };
	} );
}
