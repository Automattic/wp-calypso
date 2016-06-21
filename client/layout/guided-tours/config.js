/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

import { getSectionName, getSelectedSite, isPreviewShowing } from 'state/ui/selectors';
import { isFetchingNextPage, getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';

function sectionVisitedForFirstTime( sectionName, state ) {
	return getSectionName( state ) === sectionName;
}

function getAll() {
	return {
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
				showInContext: state => state && getSelectedSite( state ) && getSelectedSite( state ).is_previewable,
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
				showInContext: state => state && isPreviewShowing( state ),
				next: 'close-preview',
			},
			'close-preview': {
				target: 'web-preview__close',
				arrow: 'left-top',
				type: 'ActionStep',
				placement: 'beside',
				icon: 'cross-small',
				text: i18n.translate( 'Take a look at your site — and then close the site preview. You can come back here anytime.' ),
				showInContext: state => state && isPreviewShowing( state ),
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
				showInContext: state => true,
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
		themes: {
			version: '20160609',
			description: 'Learn how to find and activate a theme',
			showInContext: state => sectionVisitedForFirstTime( 'themes', state ),
			init: {
				text: i18n.translate( 'Find a theme thats good for you.' ),
				type: 'FirstStep',
				placement: 'right',
				next: 'search',
			},
			search: {
				text: i18n.translate( 'You can search for themes here, try a few terms, find a theme you like' ),
				type: 'ActionStep',
				target: 'themes-search-card',
				placement: 'below',
				continueIf: state => {
					const params = getQueryParams( state );
					return params && params.search && params.search.length && ! isFetchingNextPage( state ) && getThemesList( state ).length > 0;
				},
				arrow: 'top-left',
				next: 'filter',
			},
			filter: {
				text: i18n.translate( 'You can filter between free & paid themes. Try filtering by free themes' ),
				type: 'ActionStep',
				target: 'themes-tier-dropdown',
				placement: 'below',
				continueIf: state => {
					const params = getQueryParams( state );
					return params && params.tier === 'free';
				},
				arrow: 'top-left',
				next: 'choose-theme',
			},
			'choose-theme': {
				text: i18n.translate( 'Click on any theme, will give you a preview of how it will look like' ),
				type: 'ActionStep',
				placement: 'right',
				continueIf: state => state && isPreviewShowing( state ),
				next: 'close-preview',
			},
			'close-preview': {
				target: 'web-preview__close',
				arrow: 'left-top',
				type: 'ActionStep',
				placement: 'beside',
				icon: 'cross-small',
				text: i18n.translate( 'Close the preview' ),
				showInContext: state => state && isPreviewShowing( state ),
				next: 'finish',
			},
			finish: {
				placement: 'center',
				text: i18n.translate( "I guess that's it. I'll probably add some activation steps.", {
					components: {
						strong: <strong />,
					}
				} ),
				type: 'FinishStep',
			},
		}
	};
}

function get( tour = 'main' ) {
	return getAll()[ tour ] || getAll().main;
}

export default {
	get,
	getAll,
};
