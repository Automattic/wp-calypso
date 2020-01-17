/**
 * External dependencies
 */
import config from '../../config';
import page from 'page';

/**
 * Internal dependencies
 */
import initJetpackCloudRoutes from './routes';

/**
 * Style dependencies
 */
import 'assets/stylesheets/jetpack-cloud.scss';

window.AppBoot = () => {
	if ( ! config.isEnabled( 'jetpack-cloud' ) ) {
		window.location.href = '/';
	} else {
		initJetpackCloudRoutes( '/jetpack-cloud' );
		page.start( { decodeURLComponents: false } );
	}
};
