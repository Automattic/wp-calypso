import proxy from 'wpcom-proxy-request';
import wpcomFactory from '../../';
import wpcomOAuthFactory from 'wpcom-oauth-cors';
import debugFactory from 'debug';

const debug = debugFactory( 'media-editor' );
const isLocalhost = document.location.hostname === 'calypso.localhost';
const clientId = isLocalhost ? 49801 : 49798;

const wpcomOAuth = wpcomOAuthFactory( clientId, {
	scope: 'global',
} );

if ( isLocalhost ) {
	// run the proxy
	proxy(
		{
			metaAPI: { accessAllUsersBlogs: true },
		},
		function ( err ) {
			if ( err ) {
				throw err;
			}
			debug( 'proxy now running in "access all user\'s blogs" mode' );
		}
	);

	init( wpcomFactory( proxy ) );
} else {
	// get auth object
	wpcomOAuth.get( function ( auth ) {
		init( wpcomFactory( auth.access_token ) );
	} );
}

function init( wpcom ) {
	window.wpcom = wpcom;

	const siteNode = document.getElementById( 'site-node' );
	const imageNodeId = document.getElementById( 'image-node-id' );
	const revisionHistoryNodeOriginal = document.getElementById( 'revision-history-original' );
	const revisionHistoryNodeDetails = document.getElementById( 'revision-history-details' );
	const revisionHistoryNode = document.getElementById( 'revision-history' );
	const titleNode = document.getElementById( 'image-node-title' );
	const captionNode = document.getElementById( 'image-node-caption' );
	const descriptionNode = document.getElementById( 'image-node-description' );
	const imageContainerNode = document.getElementById( 'image-container' );
	const imageNode = document.getElementById( 'image-node' );
	const imageDetailsNode = document.getElementById( 'image-details' );

	const input = document.getElementById( 'file' );
	const deleteLink = document.getElementById( 'image-delete' );

	let mediaId = document.location.search.match( /mediaId=(\d+)/ );
	mediaId = mediaId ? Number( mediaId[ 1 ] ) : null;
	window.mediaId = mediaId;

	let siteId = document.location.search.match( /siteId=(.+)/ );
	siteId = siteId ? siteId[ 1 ] : null;
	window.siteId = siteId;

	if ( siteId ) {
		siteNode.value = siteId;
		debug( 'siteId: %o', siteId );
	} else {
		wpcom
			.me()
			.get()
			.then( ( data ) => {
				siteId = data.primary_blog_url.replace( /http\:\/\//, '' );
				siteNode.value = siteId;
				input.removeAttribute( 'disabled' );
			} );
	}

	if ( mediaId && siteId ) {
		imageNodeId.value = mediaId;
		loadImages( mediaId );
		debug( 'mediaId: %o', mediaId );
	}

	siteNode.addEventListener( 'keyup', ( event ) => {
		const value = event.target.value;
		debug( 'value: %o', value );

		if ( value.length ) {
			input.removeAttribute( 'disabled' );
		} else {
			input.setAttribute( 'disabled', true );
		}
	} );

	deleteLink.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		wpcom
			.site( siteId )
			.media( mediaId )
			.delete()
			.then( ( resp ) => debug( resp ) )
			.catch( ( error ) => debug( 'ERR: ', error ) );
	} );

	function getDate( date ) {
		if ( ! date ) {
			return 'no-date';
		}

		date = new Date( date );
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}

	function loadImages( media_id ) {
		wpcom
			.site( siteId )
			.media( media_id )
			.get()
			.then( ( image ) => {
				debug( 'image: %o', image );

				titleNode.value = image.title;
				captionNode.value = image.caption;
				descriptionNode.value = image.description;
				input.removeAttribute( 'disabled' );

				const revision_history = image.revision_history.items || [];
				const random_query_string = '?tmp=' + String( Math.random() ).substr( 2 );

				imageDetailsNode.innerHTML =
					'<p>filename: <span>' +
					'<a href="' +
					image.URL +
					random_query_string +
					'" target="_blank">' +
					image.file +
					'</a>' +
					'</span></p>' +
					'<p>revisions: <span>' +
					revision_history.length +
					'</span></p>' +
					'<p>created: <span>' +
					getDate( image.date ) +
					'</span></p>' +
					'<p>modified: <span>' +
					getDate( image.modified ) +
					'</span></p>' +
					'<p>mime_type: <span>' +
					image.mime_type +
					'</span></p>';

				imageNode.style.backgroundImage = 'url( ' + ( image.URL + random_query_string ) + ')';

				if (
					image.revision_history &&
					image.revision_history.original &&
					image.revision_history.original.URL
				) {
					revisionHistoryNodeOriginal.setAttribute( 'src', image.revision_history.original.URL );
					revisionHistoryNodeDetails.innerHTML =
						'<div>' +
						'<a' +
						'href="' +
						image.revision_history.original.URL +
						'" ' +
						'target="_blank" ' +
						'title="open `' +
						image.revision_history.original.file +
						'`"' +
						'>' +
						'<span class="image-revision-filename">' +
						image.revision_history.original.file +
						'</span>' +
						'</a>' +
						'</div>' +
						'<div class="image-revision-date">' +
						getDate( image.revision_history.original.date ) +
						'</div>' +
						'<div class="image-revision-extension">' +
						image.revision_history.original.extension +
						'</div>' +
						'<div class="image-revision-extension">extension: <em>' +
						image.revision_history.original.extension +
						'</em></div>' +
						'<div class="image-revision-mimetype">mime_type: <em>' +
						image.revision_history.original.mime_type +
						'</em></div>';
				}

				revisionHistoryNode.innerHTML = '';

				if ( revision_history && revision_history.length ) {
					for ( const index in revision_history ) {
						const prevImage = revision_history[ index ];

						const imageContainer = document.createElement( 'div' );
						imageContainer.setAttribute( 'class', 'image-container' );

						const imageElement = document.createElement( 'img' );
						imageElement.setAttribute( 'src', prevImage.URL );
						imageContainer.appendChild( imageElement );

						const imageSummary = document.createElement( 'div' );
						imageSummary.setAttribute( 'class', 'image-summary' );
						imageSummary.innerHTML =
							'<span class="image-revision-number">#' +
							index +
							'</span>' +
							'<a href="' +
							prevImage.URL +
							random_query_string +
							'" target="_blank" title="open `' +
							prevImage.file +
							'`">' +
							'<span class="image-revision-filename">' +
							prevImage.file +
							'</span>' +
							'</a>' +
							'<span class="image-revision-date">' +
							( prevImage.date ? getDate( prevImage.date ) : 'null' ) +
							'</span>' +
							'<span class="image-revision-mimetype">extension: <em>' +
							prevImage.extension +
							'</em></span>' +
							'<span class="image-revision-mimetype">mime_type: <em>' +
							prevImage.mime_type +
							'</em></span>';

						imageContainer.appendChild( imageSummary );

						revisionHistoryNode.appendChild( imageContainer );
					}
				}
			} )
			.catch( ( err ) => debug( 'ERR: ', err ) );
	}

	// select files on the "input" element
	input.onchange = function ( e ) {
		mediaId = Number( imageNodeId.value );
		siteId = siteNode.value;

		let req;

		if ( ! mediaId ) {
			const files = [];
			for ( let i = 0; i < e.target.files.length; i++ ) {
				files.push( e.target.files[ i ] );
			}

			req = wpcom
				.site( siteId )
				.media( mediaId )
				.addFiles( files, function ( err, res ) {
					if ( err ) {
						throw err;
					}

					const redirect =
						'http://' +
						document.location.host +
						( ! isLocalhost ? '/image-editor' : '' ) +
						'/?mediaId=' +
						res.media[ 0 ].ID +
						'&siteId=' +
						siteId;
					document.location.href = redirect;
				} );
		} else {
			const file = e.target.files[ 0 ];
			req = wpcom
				.site( siteId )
				.media( mediaId )
				.edit(
					{
						title: titleNode.value,
						caption: captionNode.value,
						description: descriptionNode.value,
						media: file,
					},
					( error, resp ) => {
						if ( error ) {
							return debug( 'ERR: ', error );
						}

						debug( 'resp.revision_history: %o', resp.revision_history );

						loadImages( mediaId );
						imageNode.setAttribute( 'src', resp.URL );
					}
				);
		}

		req.upload.onprogress = onprogress;
	};

	function onprogress( e ) {
		if ( e.lengthComputable ) {
			const percentComplete = ( e.loaded / e.total ) * 100;
			debug( 'progress event! ', percentComplete.toFixed( 2 ) );
		} else {
			// Unable to compute progress information since the total size is unknown
		}
	} // your token is here auth.access_token!
}
