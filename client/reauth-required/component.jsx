import { getQueryArg } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequiredComponent from 'calypso/me/reauth-required';
import './style.scss';

export default function ReauthRequired() {
	useEffect( () => {
		const handleSuccess = () => {
			const redirectTo = getQueryArg( window.location.search, 'redirect_to' );

			if ( typeof redirectTo === 'string' && redirectTo ) {
				// Prevent open redirect vulnerabilities by ensuring the redirect URL is relative
				// or points to a trusted domain (e.g., *.wordpress.com, *.wpcomstaging.com).
				// For simplicity here, we'll just check if it's a relative path.
				// A more robust check might be needed depending on security requirements.
				try {
					// Use window.location.origin as the base URL for relative paths
					const url = new URL( redirectTo, window.location.origin );
					if ( url.origin === window.location.origin || redirectTo.startsWith( '/' ) ) {
						// Use the resolved URL's href to ensure correct navigation for pathnames
						window.location.href = url.href;
					} else {
						// eslint-disable-next-line no-console
						console.warn( `Skipping potentially unsafe redirect to: ${ redirectTo }` );
						// Optionally redirect to a default safe page, e.g., '/'
						// window.location.href = '/';
					}
				} catch ( e ) {
					// Handle invalid URL if necessary
					// eslint-disable-next-line no-console
					console.error( `Invalid redirect URL: ${ redirectTo }`, e );
				}
			} else {
				// Optional: Redirect to a default location if redirect_to is not present or invalid
				// window.location.href = '/';
			}
		};

		const handleAuthStateChange = () => {
			if ( ! twoStepAuthorization.isReauthRequired() ) {
				handleSuccess();
			}
		};

		// Listen for changes in auth state
		twoStepAuthorization.on( 'change', handleAuthStateChange );

		return () => {
			twoStepAuthorization.off( 'change', handleAuthStateChange );
		};
	}, [] );

	return (
		<>
			<DocumentHead title={ translate( 'Reauth Required' ) } />
			<ReauthRequiredComponent twoStepAuthorization={ twoStepAuthorization } />
		</>
	);
}
