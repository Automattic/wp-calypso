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
		page( '/devdocs/app-components/:component?', controller.sidebar, controller.appComponents );
		page( '/devdocs/start', controller.pleaseLogIn );
		page( '/devdocs/welcome', controller.sidebar, controller.welcome );
		page( '/devdocs/data-binding', controller.sidebar, controller.databinding );
		page( '/devdocs/:path*', controller.sidebar, controller.singleDoc );
	}
};
