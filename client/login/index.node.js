/**
 * Internal dependencies
 */
import config from 'config';
import webRouter from './index.web';

export default router => {
	if ( config.isEnabled( 'login/wp-login' ) ) {
		router(
			'/log-in/en', ( { res } ) => {
				res.redirect( 301, '/log-in' );
			}
		);
	}

	webRouter( router );
};
