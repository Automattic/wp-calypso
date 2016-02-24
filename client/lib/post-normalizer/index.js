/**
 * External Dependencies
 */
var assign = require( 'lodash/assign' ),
	async = require( 'async' ),
	debug = require( 'debug' )( 'calypso:post-normalizer' ),
	cloneDeep = require( 'lodash/cloneDeep' ),
	every = require( 'lodash/every' ),
	endsWith = require( 'lodash/endsWith' ),
	filter = require( 'lodash/filter' ),
	find = require( 'lodash/find' ),
	head = require( 'lodash/head' ),
	forEach = require( 'lodash/forEach' ),
	forOwn = require( 'lodash/forOwn' ),
	map = require( 'lodash/map' ),
	maxBy = require( 'lodash/maxBy' ),
	pick = require( 'lodash/pick' ),
	some = require( 'lodash/some' ),
	srcset = require( 'srcset' ),
	startsWith = require( 'lodash/startsWith' ),
	toArray = require( 'lodash/toArray' ),
	trim = require( 'lodash/trim' ),
	uniqBy = require( 'lodash/uniqBy' ),
	url = require( 'url' ),
	values = require( 'lodash/values' );

import striptags from 'striptags';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import formatting from 'lib/formatting';
import safeImageURL from 'lib/safe-image-url';

const DEFAULT_PHOTON_QUALITY = 80, // 80 was chosen after some heuristic testing as the best blend of size and quality
	READING_WORDS_PER_SECOND = 250 / 60; // Longreads says that people can read 250 words per minute. We want the rate in words per second.

const imageScaleFactor = ( typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1 ) ? 2 : 1,
	TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function debugForPost( post ) {
	return function( msg ) {
		debug( post.global_ID + ': ' + msg );
	};
}

function stripAutoPlays( query ) {
	const keys = Object.keys( query ).filter( function( k ) {
		k = k.toLowerCase();
		return k === 'autoplay' || k === 'auto_play';
	} );
	keys.forEach( function( key ) {
		const val = query[ key ].toLowerCase();
		if ( val === '1' ) {
			query[ key ] = '0';
		} else if ( val === 'true' ) {
			query[ key ] = 'false';
		}
	} );
	return query;
}

/**
 * Asynchronously normalizes an object shaped like a post. Works on a copy of the post and does not mutate the original post.
 * @param  {object} post A post shaped object, generally returned by the API
 * @param {array} transforms An array of transforms to perform. Each transformation should be a function
 * that takes a post and a node-style callback. It should mutate the post and call the callback when complete.
 * @param {function} callback A node-style callback, invoked when the transformation is complete, or when the first error occurs.
 * If successful, the callback is invoked with `(null, theMutatedPost)`
 */
function normalizePost( post, transforms, callback ) {
	if ( ! callback ) {
		throw new Error( 'must supply a callback' );
	}
	if ( ! post || ! transforms ) {
		debug( 'no post or no transform' );
		callback( null, post );
		return;
	}

	let normalizedPost = cloneDeep( post ),
		postDebug = debugForPost( post );

	postDebug( 'running transforms' );

	async.eachSeries(
		transforms, function( transform, transformCallback ) {
			postDebug( 'running transform ' + ( transform.name || 'anonymous' ) );
			transform( normalizedPost, transformCallback );
		}, function( err ) {
			postDebug( 'transforms complete' );
			if ( err ) {
				callback( err );
			} else {
				callback( null, normalizedPost );
			}
		}
	);
}

function maxWidthPhotonishURL( imageURL, width ) {
	if ( ! imageURL ) {
		return imageURL;
	}

	let parsedURL = url.parse( imageURL, true, true ), // true, true means allow protocol-less hosts and parse the querystring
		isGravatar, sizeParam;

	if ( ! parsedURL.host ) {
		return imageURL;
	}

	isGravatar = parsedURL.host.indexOf( 'gravatar.com' ) !== -1;

	delete parsedURL.search;
	// strip other sizing params
	forEach( [ 'h', 'crop', 'resize', 'fit' ], function( param ) {
		delete parsedURL.query[ param ];
	} );

	sizeParam = isGravatar ? 's' : 'w';
	parsedURL.query[ sizeParam ] = width * imageScaleFactor;

	if ( ! isGravatar ) {
		// gravatar doesn't support these, only photon / files.wordpress
		parsedURL.query.quality = DEFAULT_PHOTON_QUALITY;
		parsedURL.query.strip = 'info'; // strip all exif data, leave ICC intact
	}

	return url.format( parsedURL );
}

function makeImageURLSafe( object, propName, maxWidth, baseURL ) {
	if ( object && object[ propName ] ) {
		if ( baseURL && ! url.parse( object[ propName ], true, true ).hostname ) {
			object[ propName ] = url.resolve( baseURL, object[ propName ] );
		}
		object[ propName ] = safeImageURL( object[ propName ] );

		if ( maxWidth ) {
			object[ propName ] = maxWidthPhotonishURL( object[ propName ], maxWidth );
		}
	}
}

function imageForURL( imageUrl ) {
	var img = new Image();
	img.src = imageUrl;
	return img;
}

function imageSizeFromAttachments( post, imageUrl ) {
	var attachments = post.attachments, found;

	if ( ! attachments ) {
		return;
	}

	found = find( attachments, function( attachment ) {
		return attachment.URL === imageUrl;
	} );

	if ( found ) {
		return {
			width: found.width,
			height: found.height
		};
	}
}

function candidateForCanonicalImage( image ) {
	if ( ! image ) {
		return false;
	}

	if ( image.naturalWidth < 350 ) {
		debug( ( image && image.src ), ': not wide enough' );
		return false;
	}

	if ( ( image.naturalWidth * image.naturalHeight ) < 30000 ) {
		debug( ( image && image.src ), ': not enough area' );
		return false;
	}
	return true;
}

function removeUnsafeAttributes( node ) {
	if ( ! node || ! node.hasAttributes() ) {
		return;
	}

	// Have to toArray this because attributes is a live
	// NodeMap and would node removals would invalidate
	// the current index as we walked it.
	forEach( toArray( node.attributes ), function( attr ) {
		if ( startsWith( attr.name, 'on' ) ) {
			node.removeAttribute( attr.name );
		}
	} );
}

const excludedContentImageUrlParts = [ 'gravatar.com' ];
function isCandidateForContentImage( imageUrl ) {
	return ! imageShouldBeRemovedFromContent( imageUrl ) && every( excludedContentImageUrlParts, function( part ) {
		return imageUrl && imageUrl.toLowerCase().indexOf( part ) === -1;
	} );
}

const bannedUrlParts = [
	'feeds.feedburner.com',
	'.feedsportal.com',
	'wp-includes',
	'wp-content/themes',
	'wp-content/plugins',
	'stats.wordpress.com',
	'pixel.wp.com'
];
function imageShouldBeRemovedFromContent( imageUrl ) {
	return some( bannedUrlParts, function( part ) {
		return imageUrl && imageUrl.toLowerCase().indexOf( part ) !== -1;
	} );
}

normalizePost.decodeEntities = function decodeEntities( post, callback ) {
	forEach( [ 'excerpt', 'title', 'site_name' ], function( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = formatting.decodeEntities( post[ prop ] );
		}
	} );

	if ( post.parent && post.parent.title ) {
		post.parent.title = formatting.decodeEntities( post.parent.title );
	}

	if ( post.author ) {
		if ( post.author.name ) {
			post.author.name = formatting.decodeEntities( post.author.name );
		}
		if ( post.author.avatar_URL ) {
			post.author.avatar_URL = safeImageURL( post.author.avatar_URL );
		}
	}

	if ( post.tags ) {
		// tags is an object
		forOwn( post.tags, function( tag ) {
			tag.name = formatting.decodeEntities( tag.name );
		} );
	}

	callback();
};

normalizePost.stripHTML = function stripHTML( post, callback ) {
	forEach( [ 'excerpt', 'title', 'site_name' ], function( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = formatting.stripHTML( post[ prop ] );
		}
	} );

	if ( post.author && post.author.name ) {
		post.author.name = formatting.stripHTML( post.author.name );
	}

	callback();
};

normalizePost.preventWidows = function preventWidows( post, callback ) {
	forEach( [ 'title', 'excerpt' ], function( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = formatting.preventWidows( post[ prop ], 2 );
		}
	} );
	callback();
};

normalizePost.firstPassCanonicalImage = function firstPassCanonicalImage( post, callback ) {
	if ( post.featured_image ) {
		post.canonical_image = assign( {
			uri: post.featured_image,
			type: 'image'
		}, imageSizeFromAttachments( post.featured_image ) );
	} else {
		let candidate = head( filter( post.attachments, function( attachment ) {
			return startsWith( attachment.mime_type, 'image/' );
		} ) );

		if ( candidate ) {
			post.canonical_image = {
				uri: candidate.URL,
				width: candidate.width,
				height: candidate.height,
				type: 'image'
			};
		}
	}

	callback();
};

normalizePost.makeSiteIDSafeForAPI = function makeSiteIDSafeForAPI( post, callback ) {
	if ( post.site_id ) {
		post.normalized_site_id = ( '' + post.site_id ).replace( /::/g, '/' );
	}

	callback();
};

normalizePost.pickPrimaryTag = function assignPrimaryTag( post, callback ) {
	// if we hand max an invalid or empty array, it returns -Infinity
	post.primary_tag = maxBy( values( post.tags ), function( tag ) {
		return tag.post_count;
	} );

	if ( post.primary_tag === undefined ) {
		delete post.primary_tag;
	}

	callback();
};

normalizePost.safeImageProperties = function( maxWidth ) {
	return function safeImageProperties( post, callback ) {
		makeImageURLSafe( post.author, 'avatar_URL', maxWidth );
		makeImageURLSafe( post, 'featured_image', maxWidth, post.URL );
		if ( post.featured_media && post.featured_media.type === 'image' ) {
			makeImageURLSafe( post.featured_media, 'uri', maxWidth, post.URL );
		}
		if ( post.canonical_image && post.canonical_image.type === 'image' ) {
			makeImageURLSafe( post.canonical_image, 'uri', maxWidth, post.URL );
		}
		if ( post.attachments ) {
			forOwn( post.attachments, function( attachment ) {
				if ( startsWith( attachment.mime_type, 'image/' ) ) {
					makeImageURLSafe( attachment, 'URL', maxWidth, post.URL );
				}
			} );
		}

		callback();
	};
};

function keepImagesThatLoad( image, acceptCallback ) {
	if ( image.complete && image.naturalWidth > 0 ) {
		acceptCallback( true );
		return; // DO NOT hook up event handlers if we're already complete
	}
	image.onload = function() {
		acceptCallback( true );
	};
	image.onerror = function() {
		acceptCallback( false );
	};
}

function convertImageToObject( image ) {
	return pick( image, [ 'src', 'naturalWidth', 'naturalHeight' ] );
}

normalizePost.waitForImagesToLoad = function waitForImagesToLoad( post, callback ) {
	function acceptLoadedImages( images ) {
		post.images = map( images, convertImageToObject );

		post.content_images = filter( map( post.content_images, function( image ) {
			return find( post.images, { src: image.src } );
		} ), Boolean );

		callback();
	}

	let imagesToCheck = [];

	if ( post.featured_image ) {
		imagesToCheck.push( imageForURL( post.featured_image ) );
	}

	forEach( post.content_images, function( image ) {
		imagesToCheck.push( imageForURL( image.src ) );
	} );

	// dedupe the set of images
	imagesToCheck = uniqBy( imagesToCheck, function( image ) {
		return image.src;
	} );

	if ( imagesToCheck.length === 0 ) {
		callback();
		return;
	}

	post.images = imagesToCheck;
	async.filter( post.images, keepImagesThatLoad, acceptLoadedImages );
};

function imageHasMinWidthAndHeight( width, height ) {
	return function( image ) {
		return image.naturalWidth >= width && image.naturalHeight >= height;
	};
}

normalizePost.keepValidImages = function( minWidth, minHeight ) {
	return function keepValidImages( post, callback ) {
		var imageFilter = imageHasMinWidthAndHeight( minWidth, minHeight );
		if ( post.images ) {
			post.images = filter( post.images, imageFilter );
		}
		if ( post.content_images ) {
			post.content_images = filter( post.content_images, imageFilter );
		}
		callback();
	};
};

normalizePost.pickCanonicalImage = function pickCanonicalImage( post, callback ) {
	var canonicalImage;
	if ( post.images ) {
		canonicalImage = filter( post.images, candidateForCanonicalImage )[ 0 ];
		if ( canonicalImage ) {
			canonicalImage = {
				uri: canonicalImage.src,
				width: canonicalImage.naturalWidth,
				height: canonicalImage.naturalHeight
			};
		}
	} else if ( post.featured_image ) {
		canonicalImage = {
			uri: post.featured_image,
			width: 0,
			height: 0
		};
	}

	if ( canonicalImage ) {
		post.canonical_image = canonicalImage;
	}
	callback();
};

normalizePost.createBetterExcerpt = function createBetterExcerpt( post, callback ) {
	if ( ! post || ! post.content ) {
		callback();
		return;
	}

	function removeElement( element ) {
		element.parentNode && element.parentNode.removeChild( element );
	}

	let betterExcerpt = striptags( post.content, [ 'p', 'br' ] );

	// Spin up a new DOM for the linebreak markup
	const dom = document.createElement( 'div' );
	dom.id = '__better_excerpt__';
	dom.innerHTML = betterExcerpt;

	// Ditch any photo captions with the wp-caption-text class
	forEach( dom.querySelectorAll( '.wp-caption-text' ), removeElement );

	// Strip any empty p and br elements from the beginning of the content
	forEach( dom.querySelectorAll( 'p,br' ), function( element ) {
		// is this element non-empty? bail on our iteration.
		if ( element.childNodes.length > 0 && trim( element.textContent ).length > 0 ) {
			return false;
		}
		element.parentNode && element.parentNode.removeChild( element );
	} );

	// now strip any p's that are empty
	forEach( dom.querySelectorAll( 'p' ), function( element ) {
		if ( trim( element.textContent ).length === 0 ) {
			element.parentNode && element.parentNode.removeChild( element );
		}
	} );

	// now limit it to the first three elements
	forEach( dom.querySelectorAll( '#__better_excerpt__ > p, #__better_excerpt__ > br' ), function( element, index ) {
		if ( index >= 3 ) {
			element.parentNode && element.parentNode.removeChild( element );
		}
	} );

	post.better_excerpt = trim( dom.innerHTML );
	dom.innerHTML = '';

	callback();
},

normalizePost.withContentDOM = function( transforms ) {
	return function withContentDOM( post, callback ) {
		if ( ! post || ! post.content || ! transforms ) {
			callback();
			return;
		}

		let postDebug = debugForPost( post );

		postDebug( 'spinning up dom' );
		// spin up the DOM
		post.__contentDOM = document.createElement( 'div' );
		post.__contentDOM.innerHTML = post.content;

		// run the transforms
		postDebug( 'running dom transforms' );
		async.eachSeries( transforms, function( transform, transformCallback ) {
			postDebug( 'running dom transform ' + ( transform.name || 'anonymous' ) );
			transform( post, transformCallback );
		}, function( err ) {
			postDebug( 'done with dom transforms' );
			// push the new DOM back in, if no error
			if ( ! err ) {
				post.content = post.__contentDOM.innerHTML;
			}
			// let go of the DOM and let the caller know we're done
			delete post.__contentDOM;
			callback( err );
		} );
	};
};

normalizePost.content = {

	removeStyles: function removeContentStyles( post, callback ) {
		if ( ! post.__contentDOM ) {
			throw new Error( 'this transform must be used as part of withContentDOM' );
		}

		// if there are any galleries in the post, skip it
		if ( post.__contentDOM.querySelector( '.gallery, .tiled-gallery' ) ) {
			callback();
			return;
		}

		// remove most style attributes
		let styled = post.__contentDOM.querySelectorAll( '[style]' );
		forEach( styled, function( element ) {
			element.removeAttribute( 'style' );
		} );

		// remove all style elements
		forEach( post.__contentDOM.querySelectorAll( 'style' ), function( element ) {
			element.parentNode && element.parentNode.removeChild( element );
		} );

		callback();
	},

	safeContentImages: function( maxWidth ) {
		return function safeContentImages( post, callback ) {
			var content_images = [],
				images;

			if ( ! post.__contentDOM ) {
				throw new Error( 'this transform must be used as part of withContentDOM' );
			}
			images = post.__contentDOM.querySelectorAll( 'img[src]' );

			// push everything, including tracking pixels, over to a safe URL
			forEach( images, function( image ) {
				let imgSource = image.getAttribute( 'src' ),
					parsedImgSrc = url.parse( imgSource, false, true ),
					hostName = parsedImgSrc.hostname;

				let safeSource;
				// if imgSource is relative, prepend post domain so it isn't relative to calypso
				if ( ! hostName ) {
					imgSource = url.resolve( post.URL, imgSource );
					parsedImgSrc = url.parse( imgSource, false, true );
				}

				safeSource = safeImageURL( imgSource );
				if ( ! safeSource && parsedImgSrc.search ) {
					// we can't make externals with a querystring safe.
					// try stripping it and retry
					parsedImgSrc.search = null;
					parsedImgSrc.query = null;
					safeSource = safeImageURL( url.format( parsedImgSrc ) );
				}

				removeUnsafeAttributes( image );

				if ( ! safeSource || imageShouldBeRemovedFromContent( imgSource ) ) {
					image.parentNode.removeChild( image );
					// fun fact: removing the node from the DOM will not prevent it from loading. You actually have to
					// change out the src to change what loads. The following is a 1x1 transparent gif as a data URL
					image.setAttribute( 'src', TRANSPARENT_GIF );
					image.removeAttribute( 'srcset' );
					return;
				}

				if ( maxWidth ) {
					safeSource = maxWidthPhotonishURL( safeSource, maxWidth );
				}

				image.setAttribute( 'src', safeSource );

				if ( image.hasAttribute( 'srcset' ) ) {
					const imgSrcSet = srcset.parse( image.getAttribute( 'srcset' ) ).map( imgSrc => {
						if ( ! url.parse( imgSrc.url, false, true ).hostname ) {
							imgSrc.url = url.resolve( post.URL, imgSrc.url );
						}
						imgSrc.url = safeImageURL( imgSrc.url );
						return imgSrc;
					} );
					image.setAttribute( 'srcset', srcset.stringify( imgSrcSet ) );
				}

				if ( isCandidateForContentImage( imgSource ) ) {
					content_images.push( {
						src: safeSource,
						original_src: imgSource,
						width: image.width,
						height: image.height
					} );
				}
			} );

			// grab all of the non-tracking pixels and push them into content_images
			content_images = filter( content_images, function( image ) {
				if ( ! image.src ) return false;
				const edgeLength = image.height + image.width;
				// if the image size isn't set (0) or is greater than 2, keep it
				return edgeLength === 0 || edgeLength > 2;
			} );

			if ( content_images.length ) {
				post.content_images = content_images;
			}

			callback();
		};
	},

	makeEmbedsSecure: function makeEmbedsSecure( post, callback ) {
		if ( ! post.__contentDOM ) {
			throw new Error( 'this transform must be used as part of withContentDOM' );
		}

		let iframes = post.__contentDOM.querySelectorAll( 'iframe' );

		const badFrames = [];

		forEach( iframes, function( iframe ) {
			iframe.setAttribute( 'sandbox', '' );
			if ( ! startsWith( iframe.src, 'http' ) ) {
				badFrames.push( iframe );
			} else {
				iframe.src = iframe.src.replace( /^http:/, 'https:' );
			}
		} );

		forEach( badFrames, function( frame ) {
			frame.parentNode.removeChild( frame );
		} );

		if ( post.is_external || post.is_jetpack ) {
			let embeds = post.__contentDOM.querySelectorAll( 'embed,object' );

			forEach( embeds, function( embed ) {
				embed.parentNode.removeChild( embed );
			} );
		}

		callback();
	},

	wordCountAndReadingTime: function wordCountAndReadingTime( post, callback ) {
		if ( ! post.__contentDOM ) {
			throw new Error( 'this transform must be used as part of withContentDOM' );
		}

		let textContent = post.__contentDOM.textContent.trim();

		post.word_count = ( textContent.replace( /['";:,.?¿\-!¡]+/g, '' ).match( /\S+/g ) || [] ).length;

		if ( post.word_count > 0 ) {
			post.reading_time = Math.ceil( post.word_count / READING_WORDS_PER_SECOND ); // in seconds
		}

		callback();
	},

	detectEmbeds: function detectEmbeds( post, callback ) {
		if ( ! post.__contentDOM ) {
			throw new Error( 'this transform must be used as part of withContentDOM' );
		}

		let embeds = toArray( post.__contentDOM.querySelectorAll( 'iframe' ) );

		const iframeWhitelist = [
			'youtube.com',
			'youtube-nocookie.com',
			'videopress.com',
			'vimeo.com',
			'cloudup.com',
			'soundcloud.com',
			'8tracks.com',
			'spotify.com'
		];

		// hosts that we trust that don't work in a sandboxed iframe
		const iframeNoSandbox = [
			'spotify.com'
		]

		embeds = filter( embeds, function( iframe ) {
			const iframeSrc = iframe.src && url.parse( iframe.src ).hostname.toLowerCase();
			return some( iframeWhitelist, function( accepted ) {
				return endsWith( '.' + iframeSrc, '.' + accepted );
			} );
		} );

		if ( ! embeds.length ) {
			callback();
			return;
		}

		post.content_embeds = map( embeds, function( iframe ) {
			var node = iframe,
				embedType = null,
				aspectRatio = 0,
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
				aspectRatio = Number( iframe.width ) / Number( iframe.height );
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
				height: height
			};
		} );

		callback();
	},

	disableAutoPlayOnMedia: function disableAutoPlayOnMedia( post, callback ) {
		if ( ! post.__contentDOM ) {
			throw new Error( 'this transform must be used as part of withContentDOM' );
		}

		let mediaElements = toArray( post.__contentDOM.querySelectorAll( 'audio, video' ) );
		mediaElements.forEach( function( mediaElement ) {
			mediaElement.autoplay = false;
		} );

		callback();
	},

	disableAutoPlayOnEmbeds: function disableAutoPlayOnEmbeds( post, callback ) {
		if ( ! post.__contentDOM ) {
			throw new Error( 'this transform must be used as part of withContentDOM' );
		}

		let embeds = toArray( post.__contentDOM.querySelectorAll( 'iframe' ) );

		embeds.forEach( function( embed ) {
			var srcUrl = url.parse( embed.src, true, true );
			if ( srcUrl.query ) {
				srcUrl.query = stripAutoPlays( srcUrl.query );
				srcUrl.search = null;
				embed.src = url.format( srcUrl );
			}
		} );

		callback();
	},

	// Attempt to find embedded Polldaddy polls - and link to any we find
	detectPolls( post, callback ) {
		if ( ! post.__contentDOM ) {
			throw new Error( 'this transform must be used as part of withContentDOM' );
		}

		// Polldaddy embed markup isn't very helpfully structured, but we can look for the noscript tag,
		// which contains the information we need, and replace it with a paragraph.
		let noscripts = toArray( post.__contentDOM.querySelectorAll( 'noscript' ) );

		noscripts.forEach( function( noscript ) {
			if ( ! noscript.firstChild ) {
				return;
			}
			let firstChildData = formatting.decodeEntities( noscript.firstChild.data );
			let match = firstChildData.match( '^<a href="http:\/\/polldaddy.com\/poll\/([0-9]+)' );
			if ( match ) {
				let p = document.createElement( 'p' );
				p.innerHTML = '<a rel="external" target="_blank" href="http://polldaddy.com/poll/' + match[1] + '">' + i18n.translate( 'Take our poll' ) + '</a>';
				noscript.parentNode.replaceChild( p, noscript );
			}
		} );

		callback();
	}

};

module.exports = normalizePost;
