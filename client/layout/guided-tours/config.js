/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

function get( site ) {
	return {
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
			next: ( () => {
				if ( site && site.is_previewable ) {
					return 'preview';
				}
				if ( site && site.is_customizable ) {
					return 'themes';
				}
				return 'finish';
			}() ),
		},
		preview: {
			target: 'site-card-preview',
			arrow: 'top-left',
			type: 'ActionStep',
			iconText: i18n.translate( "your site's name", {
				context: "Click your site's name to continue.",
			} ),
			placement: 'below',
			text: i18n.translate( 'Open {{strong}}Preview{{/strong}} to see what your site looks like.', {
				components: {
					strong: <strong />,
				}
			} ),
			next: 'close-preview',
		},
		'close-preview': {
			target: 'web-preview__close',
			arrow: 'left-top',
			type: 'ActionStep',
			placement: 'beside',
			icon: 'cross-small',
			text: i18n.translate( 'Below you can see a {{strong}}Preview{{/strong}} of your site. You can come back here anytime.', {
				components: {
					strong: <strong />,
				}
			} ),
			next: ( () => {
				if ( site && site.is_customizable ) {
					return 'themes';
				}
				return 'finish';
			}() ),
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
		}
	};
}

export default {
	get,
	version: '20160421',
};
