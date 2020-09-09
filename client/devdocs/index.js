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

export default function () {
	if ( config.isEnabled( 'devdocs' ) ) {
		page( '/devdocs', controller.sidebar, controller.devdocs, makeLayout, clientRender );
		page(
			'/devdocs/form-state-examples/:component?',
			controller.sidebar,
			controller.formStateExamples,
			makeLayout,
			clientRender
		);
		page(
			'/devdocs/design/wizard/:stepName?',
			controller.sidebar,
			controller.wizard,
			makeLayout,
			clientRender
		);
		page(
			'/devdocs/design/:component?',
			controller.sidebar,
			controller.design,
			makeLayout,
			clientRender
		);
		page(
			'/devdocs/playground/:component?',
			controller.sidebar,
			controller.playground,
			makeLayout,
			clientRender
		);
		page( '/devdocs/app-components/:component?', ( context ) =>
			page.redirect( '/devdocs/blocks/' + ( context.params.component || '' ) )
		);
		page( '/devdocs/app-components', '/devdocs/blocks' );
		page(
			'/devdocs/blocks/:component?',
			controller.sidebar,
			controller.blocks,
			makeLayout,
			clientRender
		);
		page(
			'/devdocs/wordpress-components-gallery',
			controller.sidebar,
			controller.wpComponentsGallery,
			makeLayout,
			clientRender
		);
		page(
			'/devdocs/selectors/:selector?',
			controller.sidebar,
			controller.selectors,
			makeLayout,
			clientRender
		);
		page(
			'/devdocs/typography',
			controller.sidebar,
			controller.typography,
			makeLayout,
			clientRender
		);
		page( '/devdocs/start', controller.pleaseLogIn, makeLayout, clientRender );
		page( '/devdocs/welcome', controller.sidebar, controller.welcome, makeLayout, clientRender );
		page( '/devdocs/:path*', controller.sidebar, controller.singleDoc, makeLayout, clientRender );
	}
}
