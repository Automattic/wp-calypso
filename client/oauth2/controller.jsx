import { recordPageView } from 'calypso/lib/analytics/page-view';
import LoginContextProvider from 'calypso/login/login-context';
import { AuthorizeDefault, AuthorizeStudio } from './components/authorize-variants';
import { OAUTH2_CLIENT_IDS } from './constants';
import './style.scss';

/**
 * Maps OAuth2 client IDs to their respective authorization component variants.
 * This allows different clients to have customized authorization flows.
 * Add new client variants here as they are configured.
 */
const CLIENT_VARIANT_MAP = {
	[ OAUTH2_CLIENT_IDS.STUDIO ]: AuthorizeStudio,

	// Add more client variants here as needed
};

/**
 * Gets the appropriate authorization variant component for a given client ID.
 * Falls back to the default variant if no specific variant is configured.
 * @param {string} clientId - The OAuth2 client ID from query params
 * @returns {Function} The React component for the authorization variant
 */
function getAuthorizeVariant( clientId ) {
	if ( ! clientId ) {
		return AuthorizeDefault;
	}

	// Convert string to number for lookup
	const numericClientId = parseInt( clientId, 10 );
	return CLIENT_VARIANT_MAP[ numericClientId ] || AuthorizeDefault;
}

export function bootstrap( context, next ) {
	recordPageView( '/oauth2/authorize', 'OAuth2 client authorization' );

	// Get client ID from context query params to determine which variant to use
	const clientId = context.query?.client_id;
	const AuthorizeVariant = getAuthorizeVariant( clientId );

	context.primary = (
		<LoginContextProvider>
			<AuthorizeVariant />
		</LoginContextProvider>
	);
	next();
}
