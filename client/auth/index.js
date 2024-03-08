import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { storeToken } from './controller';

export default () => {
	if ( config.isEnabled( 'oauth' ) ) {
		page( '/api/oauth/token', storeToken );
	}
};
