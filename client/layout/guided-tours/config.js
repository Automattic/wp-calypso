/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import i18n from 'lib/mixins/i18n';

function get() {
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
			placement: 'beside',
			next: config.isEnabled( 'preview-layout' ) ? 'preview' : 'themes',
		},
		preview: {
			target: 'site-card-preview',
			type: 'ActionStep',
			placement: 'beside',
			text: i18n.translate( '{{strong}}Preview:{{/strong}} Click here to see what your site looks like.', {
				components: {
					strong: <strong />,
				}
			} ),
			next: 'close-preview',
		},
		'close-preview': {
			target: 'web-preview__close',
			type: 'ActionStep',
			placement: 'beside',
			icon: 'cross-small',
			text: i18n.translate( 'Take a look at your site—and then close the site preview. You can come back here anytime.' ),
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
