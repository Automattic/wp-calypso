/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

function get( tour = 'main' ) {
	const tours = {
		main: {
			version: '201600601',
			init: {
				text: i18n.translate( "{{strong}}Need a hand?{{/strong}} We'd love to show you around the place, and give you some ideas for what to do next.", {
					components: {
						strong: <strong />,
					}
				} ),
				type: 'FirstStep',
				placement: 'right',
				next: 'my-sites',
			},
			'my-sites': {
				target: 'my-sites',
				arrow: 'top-left',
				type: 'ActionStep',
				icon: 'my-sites',
				placement: 'below',
				text: i18n.translate( "{{strong}}First things first.{{/strong}} Up here, you'll find tools for managing your site's content and design.", {
					components: {
						strong: <strong />,
					}
				} ),
				next: 'sidebar',
			},
			sidebar: {
				text: i18n.translate( 'This menu lets you navigate around, and will adapt to give you the tools you need when you need them.' ),
				type: 'BasicStep',
				target: 'sidebar',
				arrow: 'left-middle',
				placement: 'beside',
				next: 'click-preview',
			},
			'click-preview': {
				target: 'site-card-preview',
				arrow: 'top-left',
				type: 'ActionStep',
				iconText: i18n.translate( "your site's name", {
					context: "Click your site's name to continue.",
				} ),
				placement: 'below',
				showInContext: site => site && site.is_previewable,
				text: i18n.translate( "This shows your currently {{strong}}selected site{{/strong}}'s name and address.", {
					components: {
						strong: <strong />,
					}
				} ),
				next: 'in-preview',
			},
			'in-preview': {
				text: i18n.translate( "This is your site's {{strong}}Preview{{/strong}}. From here you can see how your site looks to others.", {
					components: {
						strong: <strong />,
					}
				} ),
				type: 'BasicStep',
				placement: 'center',
				showInContext: site => site && site.is_previewable,
				next: 'close-preview',
			},
			'close-preview': {
				target: 'web-preview__close',
				arrow: 'left-top',
				type: 'ActionStep',
				placement: 'beside',
				icon: 'cross-small',
				text: i18n.translate( 'Take a look at your site — and then close the site preview. You can come back here anytime.' ),
				showInContext: site => site && site.is_previewable,
				next: 'themes',
			},
			themes: {
				text: i18n.translate( "Change your {{strong}}Theme{{/strong}} to choose a new layout, or {{strong}}Customize{{/strong}} your theme's colors, fonts, and more.", {
					components: {
						strong: <strong />,
					}
				} ),
				type: 'BasicStep',
				target: 'themes',
				arrow: 'top-left',
				placement: 'below',
				showInContext: site => site && site.is_customizable,
				next: 'finish',
			},
			finish: {
				placement: 'center',
				text: i18n.translate( "{{strong}}That's it!{{/strong}} Now that you know a few of the basics, feel free to wander around.", {
					components: {
						strong: <strong />,
					}
				} ),
				type: 'FinishStep',
				linkLabel: i18n.translate( 'Learn more about WordPress.com' ),
				linkUrl: 'https://learn.wordpress.com',
			},
		},
		'reader-intro': {
			version: '20160609',
			validFrom: '20170101',
			validUntil: '20180101',
			preconditions: [
				{
					name: 'emailVerified',
				},
				{
					name: 'hoursSinceSignup',
					minHours: 0,
					maxHours: 720,
				},
				{
					name: 'seenTour',
					tourName: 'reader-intro',
					negate: true,
				},
				{
					name: 'pathMatches',
					targetSlug: '/',
				}
			],
			init: {
				text: 'You are currently looking at the Reader. Do you want to learn more about what it is?',
				type: 'FirstStep',
				placement: 'right',
				next: 'to-discover',
			},
			'to-discover': {
				text: 'This is Discover. It is a daily selection of the best content published on WordPress, collected for you by humans who love to read.',
				next: 'see-discover',
				target: 'discover',
				arrow: 'left-top',
				type: 'ActionStep',
				iconText: 'Discover',
				placement: 'beside',
			},
			'see-discover': {
				text: 'Take a look around. We have lots of great posts here.',
				next: 'follow-discover',
			},
			'follow-discover': {
				text: 'Discover is a special blog by us. Like every blog, you can follow it. Do that now, you can always unfollow later.',
				showInContext: () => ! ( document.querySelector( '.follow-button.is-following' ) ),
				target: 'follow-button',
				arrow: 'top-right',
				type: 'ActionStep',
				iconText: 'Follow',
				placement: 'beside',
				next: 'finish',
			},
			finish: {
				text: 'You are done.',
				placement: 'center',
				type: 'FinishStep',
			},
		},
		test: {
			version: '20160516',
			init: {
				description: 'Testing multi tour support',
				text: i18n.translate( 'Single step tour!' ),
				type: 'FinishStep',
			},
		}
	};

	return tours[ tour ] || tours.main;
}

export default {
	get,
};
