/** @format */

/**
 * External dependencies
 */

import page from 'page';
import config from 'config';

/**
 * Internal dependencies
 */
import controller from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'devdocs' ) ) {
		// Home
		page( '/devdocs', controller.sidebar, controller.devdocs, makeLayout, clientRender );

		// Typography
		page(
			'/devdocs/typography',
			controller.sidebar,
			controller.typography,
			makeLayout,
			clientRender
		);

		// The list of "UI Components"
		page(
			'/devdocs/design/:component?',
			controller.sidebar,
			controller.design,
			makeLayout,
			clientRender
		);

		// The list of Blocks
		page(
			'/devdocs/blocks/:component?',
			controller.sidebar,
			controller.blocks,
			makeLayout,
			clientRender
		);

		// Banner and Notice Components
		page(
			'/devdocs/components/banners/:component?',
			controller.sidebar,
			controller.banners,
			makeLayout,
			clientRender
		);

		// Text and Image Components
		page(
			'/devdocs/components/text/:component?',
			controller.sidebar,
			controller.text,
			makeLayout,
			clientRender
		);

		// I think older URL redirects?
		page( '/devdocs/app-components/:component?', context =>
			page.redirect( '/devdocs/blocks/' + ( context.params.component || '' ) )
		);
		page( '/devdocs/app-components', '/devdocs/blocks' );

		// The list of State Selectors
		page(
			'/devdocs/selectors/:selector?',
			controller.sidebar,
			controller.selectors,
			makeLayout,
			clientRender
		);

		// No idea
		page(
			'/devdocs/form-state-examples/:component?',
			controller.sidebar,
			controller.formStateExamples,
			makeLayout,
			clientRender
		);

		// Needed for the example of the Wizard component
		page(
			'/devdocs/design/wizard/:stepName?',
			controller.sidebar,
			controller.wizard,
			makeLayout,
			clientRender
		);

		// The start screen, no idea where this is linked to...
		page( '/devdocs/start', controller.pleaseLogIn, makeLayout, clientRender );

		// The Welcome screen
		page( '/devdocs/welcome', controller.sidebar, controller.welcome, makeLayout, clientRender );

		// Everything else
		page( '/devdocs/:path*', controller.sidebar, controller.singleDoc, makeLayout, clientRender );
	}
}
