import { getQueryArg } from '@wordpress/url';
import { isWebUri } from 'valid-url';

interface NoThanksRedirectParams {
	currentRoute: string;
	currentQuery: {
		from?: string;
		redirect_to?: string;
		lostpassword_flow?: string;
	};
}

export default function getNoThanksRedirectUrl( {
	currentRoute = '',
	currentQuery,
}: NoThanksRedirectParams ): string | null {
	// Hide for specific routes/flows
	if ( currentQuery.from !== 'woocommerce-core-profiler' ) {
		return null;
	}

	if (
		currentRoute === '/log-in/jetpack/lostpassword' ||
		currentRoute === '/log-in/jetpack/link' ||
		currentQuery?.lostpassword_flow
	) {
		return null;
	}

	let noThanksRedirectUrl: string | null = null;

	// WooCommerce Core Profiler, URL for the "No, thanks" is always found int eh redirect_to param.
	if ( currentQuery.redirect_to ) {
		const extracted = getQueryArg( currentQuery.redirect_to, 'redirect_uri' );
		noThanksRedirectUrl = typeof extracted === 'string' ? extracted : null;
	}

	// Only return if we have a valid redirect URL
	if ( typeof noThanksRedirectUrl === 'string' && isWebUri( noThanksRedirectUrl ) ) {
		return noThanksRedirectUrl;
	}

	return null;
}
