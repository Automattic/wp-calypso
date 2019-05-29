/**
 * External dependencies
 */
import { noop } from 'lodash';

async function querymShotsEndpoint( options = {} ) {
	const { maxRetries = 1, retryTimeout = 1000, currentRetries = 0 } = options;

	const url = options.url || '';
	const resolve = options.resolve || noop;
	const reject = options.reject || noop;

	const mShotsEndpointUrl = `https://s0.wp.com/mshots/v1/${ url }`;

	if ( ! url ) {
		// TODO translate
		reject( 'You must specify a site URL to be able to generate a preview of the site' );
		return;
	}

	try {
		const response = await fetch( mShotsEndpointUrl, { method: 'GET' } );
		const contentType = response.ok && response.headers.get( 'Content-Type' );

		if (
			// This confused me until I tried it out, so I figured I'd leave a comment.
			// The mshots API takes a while to generate an image if it's a cache miss.
			// In those situations, it returns a 307 redirecting to a default "loading" image.
			// That image is a GIF, which is what we're checking for here...
			( ! contentType || contentType === 'image/gif' ) &&
			maxRetries > 0 &&
			currentRetries < maxRetries
		) {
			// Still generating the preview or something failed in mShots. Retry.
			setTimeout(
				querymShotsEndpoint.bind( this, {
					...options,
					currentRetries: currentRetries + 1,
				} ),
				retryTimeout
			);
		} else if ( contentType === 'image/jpeg' ) {
			// Successfully generated the preview.
			try {
				const blob = await response.blob();
				resolve( window.URL.createObjectURL( blob ) );
			} catch ( e ) {
				resolve( mShotsEndpointUrl );
			}
		} else {
			reject();
		}
	} catch ( error ) {
		reject( error ); // Pass through the reject notice.
	}
}

export function loadmShotsPreview( options = {} ) {
	return new Promise( ( resolve, reject ) => {
		querymShotsEndpoint( { ...options, resolve, reject } );
	} );
}

export function prefetchmShotsPreview( url ) {
	querymShotsEndpoint( { url, currentRetries: 1 } );
}
