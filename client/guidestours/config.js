/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

function get() {
	return {
		init: {
			text: i18n.translate( "{{strong}}Need a hand?{{/strong}} We'd love to show you around the place, and give you some ideas for what to do next.", {
				components: {
					strong: <strong />,
				}
			} ),
			type: 'GuidesFirstStep',
			placement: 'right',
			next: 'my-sites',
		},
		'my-sites': {
			target: 'my-sites',
			type: 'GuidesActionStep',
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
			text: i18n.translate( 'The sidebar menu lets you navigate around, and will adapt to give you the tools you need when you need them.' ),
			type: 'GuidesBasicStep',
			target: 'sidebar',
			placement: 'beside',
			next: 'themes',
		},
		themes: {
			text: i18n.translate( "Change your {{strong}}Theme{{/strong}} to choose a new layout, or {{strong}}Customize{{/strong}} your theme's colors, font, and more.", {
				components: {
					strong: <strong />,
				}
			} ),
			type: 'GuidesBasicStep',
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
			type: 'GuidesFinishStep',
			linkLabel: i18n.translate( 'Get the Most from WordPress.com' ),
			linkUrl: 'https://learn.wordpress.com',
		}
	};
}

export default {
	get,
	version: '20160421',
};
