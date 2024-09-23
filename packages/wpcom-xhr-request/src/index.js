/**
 * Module dependencies.
 */
import debugFactory from 'debug';
import superagent from 'superagent';
import WPError from 'wp-error';

/**
 * Module variables
 */
const debug = debugFactory( 'wpcom-xhr-request' );

/**
 * Defauts
 */
const defaults = {
	apiVersion: '1',
	apiNamespace: 'wp/v2',
	authToken: null,
	body: null,
	formData: null,
	headers: null,
	method: 'get',
	query: null,
	processResponseInEnvelopeMode: true,
	onStreamRecord: () => {},
	proxyOrigin: 'https://public-api.wordpress.com',
	token: null,
	url: '',
};

/**
 * Send the request
 * @param  {Object} req - request instance
 * @param  {Object} settings - request settings
 * @param  {Function} fn - callback function
 * @returns {Object} request instance
 */
const sendResponse = ( req, settings, fn ) => {
	const { isEnvelopeMode, isRestAPI, processResponseInEnvelopeMode, onStreamRecord } = settings;

	req.end( ( error, response ) => {
		if ( error && ! response ) {
			return fn( error );
		}

		let { body, headers, statusCode } = response;
		const processResponseInStreamMode = shouldProcessInStreamMode( headers[ 'content-type' ] );

		if ( ! req.xhr ) {
			// node
			if ( processResponseInStreamMode ) {
				return fn(
					new Error( 'stream mode processing is not yet implemented for Node.js' ),
					body,
					headers
				);
			}
		}

		const { ok } = response;
		const { path, method } = response.req;
		headers.status = statusCode;

		if ( ok ) {
			// Endpoints in stream mode always send enveloped responses (see below).
			if ( ( isEnvelopeMode && processResponseInEnvelopeMode ) || processResponseInStreamMode ) {
				// override `error`, body` and `headers`
				if ( isRestAPI ) {
					headers = body.headers;
					statusCode = body.code;
					body = body.body;
				} else {
					headers = body.headers;
					statusCode = body.status;
					body = body.body;
				}

				headers = { ...headers, status: statusCode };

				if ( null !== statusCode && 2 !== Math.floor( statusCode / 100 ) ) {
					debug( 'Error detected!' );
					const wpe = WPError( { path, method }, statusCode, body );
					return fn( wpe, null, headers );
				}
			}
			return fn( null, body, headers );
		}

		const wpe = WPError( { path, method }, statusCode, body );
		return fn( wpe, null, headers );
	} );

	if ( req.xhr ) {
		// web
		req.xhr.addEventListener( 'readystatechange', ( event ) => {
			if ( event.target.readyState !== window.XMLHttpRequest.HEADERS_RECEIVED ) {
				return;
			}

			if ( shouldProcessInStreamMode( event.target.getResponseHeader( 'Content-Type' ) ) ) {
				enableStreamModeProcessing( req, onStreamRecord );
			}
		} );
	}

	return req;
};

function shouldProcessInStreamMode( contentType ) {
	return /^application[/]x-ndjson($|;)/.test( contentType );
}

// Endpoints in stream mode behave like ordinary endpoints, in that the response contains a JSON
// representation of some value or WP_Error, but they will also stream other JSON records before
// that (e.g. progress messages), in application/x-ndjson format.
//
// The intent is for the last line of a $stream mode response to be exactly the same as the non-
// $stream response, but always enveloped as if we were in ?_envelope=1. The other JSON records
// are also enveloped in the same way, but with .status == 100.
//
// One might object to enveloping as a matter of principle, but it’s unavoidable in both of these
// cases. For the last line, which represents the whole response in non-$stream mode, we need to
// convey the HTTP status code after the body has started. For the other lines, we need a way to
// distinguish them from the last line, so we can exclude them without a “delay line”.
function enableStreamModeProcessing( req, onStreamRecord ) {
	// Streaming responses is trickier than you might expect, with many footguns:
	// • req.buffer(false): no version of superagent implements this when running in the browser
	// • req.parse() or superagent.parse[]: only gets called when the response ends (see above)
	// • req.on("progress"): doesn’t seem to work... at all
	// • req.responseType(anything): makes superagent skip parse functions (see above)
	// • req.xhr.responseType="blob": XHR only exposes partial responses in "" or "text" modes
	// • req.xhr: only available after you call req.end()

	// Expose partial responses.
	// <https://xhr.spec.whatwg.org/#the-response-attribute>
	req.xhr.responseType = 'text';

	// Find response chunks that end in a newline (possibly preceded by a carriage return), then
	// for each chunk except the last, parse it as JSON and pass that to onStreamRecord.
	// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#31-serialization>
	// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#32-parsing>
	// <https://stackoverflow.com/a/38440028>
	let lastLine = null;
	let start = 0;

	// A progress event is guaranteed to be fired after the end of the response body, so we
	// should never miss any data.
	// <https://xhr.spec.whatwg.org/#the-send()-method>
	// <https://xhr.spec.whatwg.org/#handle-response-end-of-body>
	req.xhr.addEventListener( 'progress', ( { target } ) => {
		// Don’t use ProgressEvent#loaded in this algorithm. It measures progress in octets,
		// while we’re working with text that has already been decoded from UTF-8 into a string
		// that can only be indexed in UTF-16 code units. Reconciling this difference is not
		// worth the effort, and might even be impossible if there were encoding errors.
		while ( true ) {
			const stop = target.response.indexOf( '\n', start );

			if ( stop < 0 ) {
				// Leave start untouched for the next progress event, waiting for the newline
				// that indicates we’ve finished receiving a full line.
				break;
			}

			lastLine = target.response.slice( start, stop );

			// Parse the response chunk as JSON, ignoring trailing carriage returns.
			// Note: not ignoring empty lines.
			// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#32-parsing>
			const record = JSON.parse( lastLine );

			// Non-last lines should have .status == 100.
			if ( record.status < 200 ) {
				debug( 'stream mode: record=%o', record );
				onStreamRecord( record.body );
			}

			// Make subsequent searches start *after* the newline.
			start = stop + 1;
		}
	} );

	// Parse the last response chunk as above, but pass it to the higher layers as The Response.
	// Note: not ignoring empty lines.
	// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#32-parsing>
	req.parse( () => JSON.parse( lastLine ) );
}

/**
 * Returns `true` if `v` is a File Form Data, `false` otherwise.
 * @param {Object} v - instance to analyze
 * @returns {boolean} `true` if `v` is a DOM File instance
 */
function isFile( v ) {
	return (
		v instanceof Object && 'undefined' !== typeof window && v.fileContents instanceof window.Blob
	);
}

/**
 * Performs an XMLHttpRequest against the WordPress.com REST API.
 * @param {Object | string} options - `request path` or `request parameters`
 * @param {Function} fn - callback function
 * @returns { Object } xhr instance
 */
export default function request( options, fn ) {
	if ( 'string' === typeof options ) {
		options = { path: options };
	}

	const settings = { ...defaults, ...options };

	// is REST-API api?
	settings.isRestAPI = options.apiNamespace === undefined;

	// normalize request-method name
	settings.method = settings.method.toLowerCase();

	// normalize origin
	if ( typeof settings.proxyOrigin !== 'undefined' ) {
		if ( settings.proxyOrigin.charAt( settings.proxyOrigin.length - 1 ) === '/' ) {
			settings.proxyOrigin = settings.proxyOrigin.slice( 0, -1 );
		}
	}

	const {
		apiNamespace,
		apiVersion,
		authToken,
		body,
		formData,
		headers,
		isRestAPI,
		method,
		proxyOrigin,
		query,
		token,
	} = settings;

	// request base path
	let basePath;

	if ( isRestAPI ) {
		basePath = `/rest/v${ apiVersion }`;
	} else if ( apiNamespace && /\//.test( apiNamespace ) ) {
		basePath = '/' + apiNamespace; // wpcom/v2
	} else {
		basePath = '/wp-json'; // /wp-json/sites/%s/wpcom/v2 (deprecated)
	}

	// Envelope mode FALSE as default
	settings.isEnvelopeMode = false;

	settings.url = proxyOrigin + basePath + settings.path;
	debug( 'API URL: %o', settings.url );

	// create HTTP Request instance
	const req = superagent[ method ]( settings.url );
	if ( query ) {
		req.query( query );
		debug( 'API send URL querystring: %o', query );
		if ( typeof query === 'string' ) {
			settings.isEnvelopeMode = isRestAPI
				? query.includes( 'http_envelope=1' )
				: query.includes( '_envelope=1' );
		} else {
			settings.isEnvelopeMode = isRestAPI ? query.http_envelope : query._envelope;
		}

		debug( 'envelope mode: %o', settings.isEnvelopeMode );
	}

	// body
	if ( body && formData ) {
		debug( 'API ignoring body because formData is set. They cannot both be used together.' );
	}
	if ( body && ! formData ) {
		req.send( body );
		debug( 'API send POST body: %o', body );
	}

	// POST FormData (for `multipart/form-data`, usually a file upload)
	if ( formData ) {
		for ( let i = 0; i < formData.length; i++ ) {
			const data = formData[ i ];
			const key = data[ 0 ];
			const value = data[ 1 ];
			debug( 'adding FormData field %o: %o', key, value );

			if ( isFile( value ) ) {
				req.attach( key, new window.File( [ value.fileContents ], value.fileName ) );
			} else {
				req.field( key, value );
			}
		}
	}

	// headers
	if ( headers ) {
		req.set( headers );
		debug( 'adding HTTP headers: %o', headers );
	}

	if ( authToken || token ) {
		req.set( 'Authorization', `Bearer ${ authToken || token }` );
	}

	if ( ! req.get( 'Accept' ) ) {
		// set a default "Accept" header preferring a JSON response
		req.set( 'Accept', '*/json,*/*' );
	}

	sendResponse( req, settings, fn );

	return req.xhr;
}
