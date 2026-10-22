import type { JetpackCrmExtension, JetpackCrmExtensionDownload } from './types';

// `message` is the server's own explanation, sent only with `success: false`.
// An HTTP error leaves it empty, so callers go by `status` instead.
export class JetpackCrmRequestError extends Error {
	status: number;

	constructor( status: number, message: string ) {
		super( message );
		this.name = 'JetpackCrmRequestError';
		this.status = status;
	}
}

// The CRM download server is separate from WordPress.com and needs no credentials.
async function requestJetpackCrm(
	appUrl: string,
	path: string,
	init: RequestInit
): Promise< Record< string, unknown > > {
	const response = await fetch( `${ appUrl }${ path }`, {
		...init,
		credentials: 'omit',
		headers: { 'Content-Type': 'application/json' },
	} );

	if ( ! response.ok ) {
		throw new JetpackCrmRequestError( response.status, '' );
	}

	const data = await response.json();
	if ( ! data?.success ) {
		throw new JetpackCrmRequestError( response.status, data?.message ?? '' );
	}

	return data;
}

export async function fetchJetpackCrmExtensions(
	appUrl: string
): Promise< JetpackCrmExtension[] > {
	const data = await requestJetpackCrm( appUrl, '/api/extensions', { method: 'GET' } );
	if ( ! Array.isArray( data.extensions ) ) {
		throw new JetpackCrmRequestError( 200, '' );
	}
	return data.extensions;
}

function isHttpsUrl( value: unknown ): value is string {
	if ( typeof value !== 'string' ) {
		return false;
	}
	try {
		return new URL( value ).protocol === 'https:';
	} catch {
		return false;
	}
}

export async function fetchJetpackCrmExtensionDownload(
	appUrl: string,
	licenseKey: string,
	extensionSlug: string
): Promise< JetpackCrmExtensionDownload > {
	const data = await requestJetpackCrm( appUrl, '/api/downloads/jetpack-complete', {
		method: 'POST',
		body: JSON.stringify( { license_key: licenseKey, extension_slug: extensionSlug } ),
	} );
	// The link is opened with `location.assign`, so anything but an https URL
	// (a `javascript:` URL, say) must never get that far.
	if ( ! isHttpsUrl( data.download_url ) ) {
		throw new JetpackCrmRequestError( 200, '' );
	}
	return { download_url: data.download_url };
}
