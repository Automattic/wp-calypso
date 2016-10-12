/**
 * External Dependencies
 */
import endsWith from 'lodash/endsWith';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import map from 'lodash/map';
import some from 'lodash/some';
import toArray from 'lodash/toArray';
import url from 'url';

/**
 * Internal Dependencies
 */
export default function detectEmbeds( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	let embeds = toArray( dom.querySelectorAll( 'iframe' ) );

	const iframeWhitelist = [
		'youtube.com',
		'youtube-nocookie.com',
		'videopress.com',
		'vimeo.com',
		'cloudup.com',
		'soundcloud.com',
		'8tracks.com',
		'spotify.com',
		'me.sh',
		'bandcamp.com',
		'kickstarter.com',
		'facebook.com',
		'embed.itunes.apple.com'
	];

	// hosts that we trust that don't work in a sandboxed iframe
	const iframeNoSandbox = [
		'spotify.com',
		'kickstarter.com'
	];

	// get the iframe src that autoplays the embed if we know how to, else null
	const getAutoplayIframe = ( iframe ) => {
		if ( iframe.src.indexOf( 'youtube' ) > 0 ) {
			const autoplayIframe = iframe.cloneNode();
			autoplayIframe.src += ';autoplay=1';
			return autoplayIframe.outerHTML;
		}
		return null;
	};

	// get a picture thumnail version of the embed if it exists, else null
	const getThumbnailUrl = ( iframe ) => {
		if ( iframe.src.indexOf( 'youtube' ) > 0 ) {
			// grabbed from: http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
			// TODO find better solution than crazy regex that nobody will ever understand
			const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
			const match = iframe.src.match( regExp );
			const videoId = match && ( match && match[ 2 ].length === 11 ) ? match[ 2 ] : false;

			return videoId ? `https://img.youtube.com/vi/${ videoId }/0.jpg` : null;
		}
		return null;
	};

	embeds = filter( embeds, function( iframe ) {
		const iframeSrc = iframe.src && url.parse( iframe.src ).hostname.toLowerCase();
		return some( iframeWhitelist, function( accepted ) {
			return endsWith( '.' + iframeSrc, '.' + accepted );
		} );
	} );

	const content_embeds = map( embeds, function( iframe ) {
		let node = iframe,
			embedType = null,
			aspectRatio,
			width, height,
			matches;

		const iframeHost = iframe.src && url.parse( iframe.src ).hostname.toLowerCase();
		const trustedHost = some( iframeNoSandbox, function( accepted ) {
			return endsWith( '.' + iframeHost, '.' + accepted );
		} );

		if ( trustedHost ) {
			iframe.removeAttribute( 'sandbox' );
		} else {
			// we allow featured iframes to use a free-er sandbox
			iframe.setAttribute( 'sandbox', 'allow-same-origin allow-scripts allow-popups' );
		}

		if ( iframe.width && iframe.height ) {
			width = Number( iframe.width );
			height = Number( iframe.height );
			if ( ! isNaN( width ) && ! isNaN( height ) ) {
				aspectRatio = width / height;
			}
			if ( isNaN( width ) ) {
				width = iframe.width;
			}
			if ( isNaN( height ) ) {
				height = iframe.height;
			}
		}

		const embedUrl = iframe.getAttribute( 'data-wpcom-embed-url' );

		do {
			if ( ! node.className ) {
				continue;
			}
			matches = node.className.match( /\bembed-([-a-zA-Z0-9_]+)\b/ );
			if ( matches ) {
				embedType = matches[ 1 ];
				break;
			}
		} while ( ( node = node.parentNode ) );

		return {
			type: embedType,
			src: iframe.src,
			embedUrl,
			iframe: iframe.outerHTML,
			aspectRatio: aspectRatio,
			width: width,
			height: height,
			thumbnailUrl: getThumbnailUrl( iframe ),
			autoplayIframe: getAutoplayIframe( iframe ),
		};
	} );

	const funnyEmbedSelectors = {
		'blockquote[class^="instagram-"]': 'instagram',
		'blockquote[class^="twitter-"]': 'twitter',
		'fb\\\:post': 'facebook',
		'[class^="fb-"]': 'facebook'
	};

	forOwn( funnyEmbedSelectors, function( type, selector ) {
		const funnyEmbeds = toArray( dom.querySelectorAll( selector ) );
		forEach( funnyEmbeds, function( node ) {
			content_embeds.push( {
				type: 'special-' + type,
				content: node.outerHTML
			} );
		} );
	} );

	if ( content_embeds.length ) {
		post.content_embeds = content_embeds;
	}

	return post;
}

