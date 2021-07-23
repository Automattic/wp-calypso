import config from '@automattic/calypso-config';
import page from 'page';
import { storeToken } from './controller';

export default () => {
	if ( config.isEnabled( 'oauth' ) ) {
		page( '/api/oauth/token', storeToken );
	}
};
