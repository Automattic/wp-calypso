/**
 * Internal dependencies
 */
import config from 'config';
import { isWooOAuth2Client } from 'lib/oauth2-clients';

export default ( req ) => {
	const oauthClientId = req.query.oauth2_client_id || req.query.client_id;
	const isWCComConnect =
		config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
		( 'login' === req.context.sectionName || 'signup' === req.context.sectionName ) &&
		req.query[ 'wccom-from' ] &&
		isWooOAuth2Client( { id: parseInt( oauthClientId ) } );

	return {
		isWCComConnect,
	};
};
