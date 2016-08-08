/**
 * External dependencies
 */
import page from 'page';
import config from 'config';

/**
 * Internal dependencies
 */
import controller from './controller';

export default function() {
	if ( config.isEnabled( 'devdocs' ) ) {
		page( '/devdocs', controller.sidebar, controller.devdocs );
		page( '/devdocs/form-state-examples/:component?', controller.sidebar, controller.formStateExamples );
		page( '/devdocs/design/typography', controller.sidebar, controller.typography );
		page( '/devdocs/design/:component?', controller.sidebar, controller.design );
		page( '/devdocs/blocks/:component?', controller.sidebar, controller.blocks );
		page( '/devdocs/blocks/:component?', controller.sidebar, controller.blocks );
		page( '/devdocs/start', controller.pleaseLogIn );
		page( '/devdocs/welcome', controller.sidebar, controller.welcome );
		page( '/devdocs/:path*', controller.sidebar, controller.singleDoc );
	}
}
