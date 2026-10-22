import { localizeUrl } from '@automattic/i18n-utils';

function stringifyBody( bodyObj: object ) {
	// Clone bodyObj, replacing null or undefined values with empty strings.
	const body = Object.fromEntries(
		Object.entries( bodyObj ?? {} ).map( ( [ key, val ] ) => [ key, val ?? '' ] )
	);
	return new globalThis.URLSearchParams( body ).toString();
}

/**
 * POSTs a form to one of the JSON actions of `wp-login.php`, which authenticate with the
 * WordPress.com session cookie rather than through the REST API.
 */
export async function postWpLoginAction< ResultType >(
	action: string,
	bodyObj: object
): Promise< { data: ResultType } > {
	const response = await globalThis.fetch(
		localizeUrl( `https://wordpress.com/wp-login.php?action=${ action }` ),
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: stringifyBody( bodyObj ),
		}
	);

	if ( response.ok ) {
		return response.json();
	}
	throw new Error( await response.text() );
}
