/** @format */
/**
 * External dependencies
 */
import request from 'superagent';
import { get, noop } from 'lodash';

const querymShotsEndpoint = options => {
	const maxRetries = get( options, 'maxRetries', 1 );
	const retryTimeout = get( options, 'retryTimeout', 1000 );
	const currentRetries = get( options, 'currentRetries', 0 );
	const url = options.url || '';

	const resolve = options.resolve || noop;
	const reject = options.reject || noop;

	const mShotsEndpointUrl = `https://s0.wp.com/mshots/v1/${ url }`;

	if ( ! url ) {
		// TODO translate
		reject( 'You must specify a site URL to be able to generate a preview of the site' );
		return;
	}

	request
		.get( mShotsEndpointUrl )
		.responseType( 'blob' )
		.then( res => {
			if (
				( res.type === null || res.type === 'image/gif' ) &&
				maxRetries > 0 &&
				currentRetries < maxRetries
			) {
				// Still generating the preview or something failed in mShots
				setTimeout(
					querymShotsEndpoint.bind( this, {
						...options,
						currentRetries: currentRetries + 1,
					} ),
					retryTimeout
				);
			} else if ( res.type === 'image/jpeg' ) {
				// Successfully generated the preview
				try {
					resolve( window.URL.createObjectURL( res.xhr.response ) );
				} catch ( e ) {
					resolve( mShotsEndpointUrl );
				}
			} else {
				reject();
			}
		} )
		.catch( reject ); // Pass through the reject notice
};

export const loadmShotsPreview = ( options = {} ) => {
	return new Promise( ( resolve, reject ) => {
		querymShotsEndpoint( { ...options, resolve, reject } );
	} );
};

export const prefetchmShotsPreview = url => querymShotsEndpoint( { url, currentRetries: 1 } );
