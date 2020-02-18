/**
 * External dependencies
 */
import config from '../../config';

/**
 * Internal dependencies
 */
import initJetpackCloudRoutes from './routes';
import { bootApp } from 'boot/common';

/**
 * Style dependencies
 */
import 'components/environment-badge/style.scss';
import 'layout/style.scss';
import 'assets/stylesheets/jetpack-cloud.scss';

window.AppBoot = () => {
	if ( ! config.isEnabled( 'jetpack-cloud' ) ) {
		window.location.href = '/';
	} else {
		initJetpackCloudRoutes();
		bootApp( 'Jetpack Cloud' );
	}
};
