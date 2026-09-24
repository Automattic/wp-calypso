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
async function requestJetpackCrm< T >(
	appUrl: string,
	path: string,
	init: RequestInit
): Promise< T > {
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
	const data = await requestJetpackCrm< { extensions?: JetpackCrmExtension[] } >(
		appUrl,
		'/api/extensions',
		{ method: 'GET' }
	);
	if ( ! Array.isArray( data.extensions ) ) {
		throw new JetpackCrmRequestError( 200, '' );
	}
	return data.extensions;
}

export async function fetchJetpackCrmExtensionDownload(
	appUrl: string,
	licenseKey: string,
	extensionSlug: string
): Promise< JetpackCrmExtensionDownload > {
	return requestJetpackCrm< JetpackCrmExtensionDownload >(
		appUrl,
		'/api/downloads/jetpack-complete',
		{
			method: 'POST',
			body: JSON.stringify( { license_key: licenseKey, extension_slug: extensionSlug } ),
		}
	);
}
