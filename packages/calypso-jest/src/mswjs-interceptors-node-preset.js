/**
 * Replaces `@mswjs/interceptors/presets/node`, which `nock` uses to intercept requests.
 *
 * The original preset also patches `XMLHttpRequest`, which in JSDOM adds a custom request header that
 * triggers a CORS preflight `OPTIONS` request nock can't match. JSDOM's `XMLHttpRequest` is built on
 * top of Node's `http` module, so the `ClientRequest` interceptor already covers it.
 *
 * `nock` accesses the interceptors by index, so the order must match the original preset.
 */
const { ClientRequestInterceptor } = require( '@mswjs/interceptors/ClientRequest' );
const { XMLHttpRequestInterceptor } = require( '@mswjs/interceptors/XMLHttpRequest' );
const { FetchInterceptor } = require( '@mswjs/interceptors/fetch' );

class DisabledXMLHttpRequestInterceptor extends XMLHttpRequestInterceptor {
	checkEnvironment() {
		return false;
	}
}

const interceptors = [
	new ClientRequestInterceptor(),
	new DisabledXMLHttpRequestInterceptor(),
	new FetchInterceptor(),
];

// Each test file gets its own copy of `nock`, but they all patch the same Node `http` module. Remove
// this copy's patches once the file is done, otherwise it keeps handling requests from later files
// that run in the same worker.
if ( typeof afterAll === 'function' ) {
	try {
		afterAll( () => interceptors.forEach( ( interceptor ) => interceptor.dispose() ) );
	} catch {
		// `nock` was first loaded from inside a test or hook, where hooks can't be registered.
	}
}

module.exports = interceptors;
