import * as tus from 'tus-js-client';
import Media from './site.media';

/**
 * This class is an adapted version of wpcom's TUS uploader use-uploader.js.
 * It enables resumable uploads for videos.
 */
export default class TusUploader {
	constructor( wpcom, sid ) {
		this.wpcom = wpcom;
		this._sid = sid;
	}

	createGetJwtRequest = ( key ) => {
		const params = {
			path: '/sites/' + this._sid + '/media/videopress-upload-jwt',
			apiNamespace: 'wpcom/v2',
		};

		if ( key ) {
			params.key = key;
		}

		return this.wpcom.req.post( params, {}, null, null );
	};

	performOnboardingVideoUpload = ( files, { onError, onSuccess, onProgress } ) => {
		const file = files[ 0 ];
		const uploader = this.resumableUploader( {
			onError,
			onSuccess,
			onProgress,
		} );

		return this.createGetJwtRequest().then( ( jwtData ) => uploader( file, jwtData ) );
	};

	startUpload = ( files ) => {
		const file = files[ 0 ];
		return new Promise( ( resolve, reject ) => {
			const uploader = this.resumableUploader( {
				onError: ( error ) => reject( error ),
				onSuccess: ( args ) => {
					const media = new Media( args.mediaId, this._sid, this.wpcom );
					media
						.get()
						.then( ( res ) => resolve( { media: [ res ] } ) )
						.catch( ( err ) => reject( err ) );
				},
				onProgress: (/*bytesUploaded, bytesTotal*/) => {},
			} );

			return this.createGetJwtRequest().then( ( jwtData ) => uploader( file, jwtData ) );
		} );
	};

	resumableUploader = ( { onError, onProgress, onSuccess } ) => {
		const jwtsForKeys = {};
		// Keep in sync with wpcom's use-uploader.js
		return ( file, data ) => {
			const upload = new tus.Upload( file, {
				onError: onError,
				onProgress: onProgress,
				endpoint: 'https://public-api.wordpress.com/rest/v1.1/video-uploads/' + this._sid + '/',
				removeFingerprintOnSuccess: true,
				withCredentials: false,
				autoRetry: true,
				overridePatchMethod: false,
				chunkSize: 10000000, // 10Mb.
				allowedFileTypes: [ 'video/*' ],
				metadata: {
					filename: file.name,
					filetype: file.type,
				},
				retryDelays: [ 0, 1000, 3000, 5000, 10000 ],
				onAfterResponse: ( req, res ) => {
					// Why is this not showing the x-headers?
					if ( res.getStatus() >= 400 ) {
						return;
					}

					const GUID_HEADER = 'x-videopress-upload-guid';
					const MEDIA_ID_HEADER = 'x-videopress-upload-media-id';
					const SRC_URL_HEADER = 'x-videopress-upload-src-url';
					const guid = res.getHeader( GUID_HEADER );
					const mediaId = res.getHeader( MEDIA_ID_HEADER );
					const src = res.getHeader( SRC_URL_HEADER );
					if ( guid && mediaId && src ) {
						onSuccess && onSuccess( { mediaId: Number( mediaId ), guid, src } );
						return;
					}

					const headerMap = {
						'x-videopress-upload-key-token': 'token',
						'x-videopress-upload-key': 'key',
					};

					const tokenData = {};
					Object.keys( headerMap ).forEach( function ( header ) {
						const value = res.getHeader( header );
						if ( ! value ) {
							return;
						}

						tokenData[ headerMap[ header ] ] = value;
					} );

					if ( tokenData.key && tokenData.token ) {
						jwtsForKeys[ tokenData.key ] = tokenData.token;
					}
				},
				onBeforeRequest: ( req ) => {
					// make ALL requests be either POST or GET to honor the public-api.wordpress.com "contract".
					const method = req._method;
					if ( [ 'HEAD', 'OPTIONS' ].indexOf( method ) >= 0 ) {
						req._method = 'GET';
						req.setHeader( 'X-HTTP-Method-Override', method );
					}

					if ( [ 'DELETE', 'PUT', 'PATCH' ].indexOf( method ) >= 0 ) {
						req._method = 'POST';
						req.setHeader( 'X-HTTP-Method-Override', method );
					}

					req._xhr.open( req._method, req._url, true );
					// Set the headers again, reopening the xhr resets them.
					Object.keys( req._headers ).map( function ( headerName ) {
						req.setHeader( headerName, req._headers[ headerName ] );
					} );

					if ( 'POST' === method ) {
						const hasJWT = !! data.upload_token;
						if ( hasJWT ) {
							req.setHeader( 'x-videopress-upload-token', data.upload_token );
						} else {
							throw 'should never happen';
						}
					}

					if ( [ 'OPTIONS', 'GET', 'HEAD', 'DELETE', 'PUT', 'PATCH' ].indexOf( method ) >= 0 ) {
						const url = new URL( req._url );
						const path = url.pathname;
						const parts = path.split( '/' );
						const maybeUploadkey = parts[ parts.length - 1 ];
						if ( jwtsForKeys[ maybeUploadkey ] ) {
							req.setHeader( 'x-videopress-upload-token', jwtsForKeys[ maybeUploadkey ] );
						} else if ( 'HEAD' === method ) {
							return this.createGetJwtRequest( maybeUploadkey ).then( ( responseData ) => {
								jwtsForKeys[ maybeUploadkey ] = responseData.token;
								req.setHeader( 'x-videopress-upload-token', responseData.token );
								return req;
							} );
						}
					}

					return Promise.resolve( req );
				},
			} );

			upload.findPreviousUploads().then( function ( previousUploads ) {
				if ( previousUploads.length ) {
					upload.resumeFromPreviousUpload( previousUploads[ 0 ] );
				}

				upload.start();
			} );

			return upload;
		};
	};
}
