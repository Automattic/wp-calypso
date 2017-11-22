/**
 * External dependencies
 *
 * @format
 */

import { assign, map } from 'lodash';

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
	},
	avatar_uploaded: {
		title: 'Upload your profile picture',
		description:
			'Who’s the person behind the site? Personalize your posts and comments with a custom avatar.',
		duration: '2 mins',
		completedTitle: 'You uploaded an avatar',
		completedButtonText: 'Change',
	},
	blogname_set: {
		title: 'Personalize your site',
		description: 'Give your site a descriptive name to entice visitors.',
		duration: '1 min',
		completedTitle: 'You updated your site title',
		completedButtonText: 'Edit',
	},
	blogdescription_set: {
		title: 'Create a tagline',
		description: 'Pique readers’ interest with a little more detail about your site.',
		duration: '2 mins',
		completedTitle: 'You created a tagline',
		completedButtonText: 'Change',
	},
	contact_page_updated: {
		title: 'Personalize your Contact page',
		description: 'Encourage visitors to get in touch — a website is for connecting with people.',
		duration: '2 mins',
		completedTitle: 'You updated your Contact page',
		completedButtonText: 'Edit',
	},
	custom_domain_registered: {
		title: 'Register a custom domain',
		description:
			'Memorable domain names make it easy for people to remember your address — and search engines love ’em.',
		duration: '2 mins',
		completedTitle: 'You registered a custom domain',
		completedButtonText: 'Add email',
	},
	domain_selected: {
		title: 'Pick a website address',
		description: 'Choose an address so people can find you on the internet.',
		completedTitle: 'You picked a website address',
		completed: true,
	},
	post_published: {
		title: 'Publish your first blog post',
		description: 'Introduce yourself to the world! That’s why you’re here.',
		duration: '10 mins',
		completedTitle: 'You published your first blog post',
		completedButtonText: 'Edit',
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
	},
	social_links_set: {
		title: 'Display links to your social accounts',
		description: 'Let your audience know where else they can find you online.',
		duration: '2 mins',
		completedTitle: 'You added your social accounts.',
		completedButtonText: 'Change',
	},
};

const sequence = [
	'site_created',
	'domain_selected',
	'blogname_set',
	'site_icon_set',
	'blogdescription_set',
	'avatar_uploaded',
	'social_links_set',
	'about_page_updated',
	'contact_page_updated',
	'post_published',
	'custom_domain_registered',
];

export const onboardingTasks = currentState =>
	map( sequence, id => {
		const completed = currentState[ id ];
		return assign( { id, completed }, tasks[ id ] );
	} );
