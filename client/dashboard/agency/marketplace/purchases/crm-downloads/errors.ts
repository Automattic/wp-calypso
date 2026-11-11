import { JetpackCrmRequestError } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';

export const getConnectionErrorMessage = () =>
	__( 'Could not connect to download server. Please check your connection and try again.' );

function getErrorMessage( error: Error, statusMessages: Record< number, string > ) {
	const message =
		error instanceof JetpackCrmRequestError
			? error.message || statusMessages[ error.status ] || getConnectionErrorMessage()
			: getConnectionErrorMessage();
	/* translators: %s is an error message from the download server */
	return sprintf( __( 'Error: %s' ), message );
}

export function getExtensionsErrorMessage( error: Error ) {
	return getErrorMessage( error, {
		404: __( 'Extensions not found' ),
	} );
}

export function getDownloadErrorMessage( error: Error ) {
	return getErrorMessage( error, {
		400: __( 'Missing required fields' ),
		401: __( 'Invalid API key' ),
		403: __( 'Invalid license key format. Must be a Jetpack Complete license key.' ),
		404: __( 'Extension not found' ),
	} );
}
