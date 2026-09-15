import { loadScript, loadjQueryDependentScript } from '@automattic/load-script';
import clsx from 'clsx';
import debugFactory from 'debug';
import { createRef, PureComponent } from 'react';
import { createRoot } from 'react-dom/client';
import DotPager from '../dot-pager';
import { addImageCarousel } from '../image-carousel';

const noop = () => {};
const debug = debugFactory( 'calypso:components:embed-container' );

const embedsToLookFor = {
	'blockquote[class^="instagram-"]': embedInstagram,
	'blockquote[class^="twitter-"], a[class^="twitter-"]': embedTwitter,
	'fb\\:post, [class^=fb-]': embedFacebook,
	'[class^=tumblr-]': embedTumblr,
	'.jetpack-slideshow': embedSlideshow,
	'.wp-block-jetpack-story': embedStory,
	'.embed-reddit': embedReddit,
	'.embed-tiktok': embedTikTok,
	'.wp-block-jetpack-slideshow, .wp-block-newspack-blocks-carousel': embedCarousel,
	'.wp-block-jetpack-tiled-gallery': embedTiledGallery,
	'.wp-block-gallery': embedGallery,
	'.wp-embedded-content': embedWordPressPost,
	'a[data-pin-do="embedPin"]': embedPinterest,
	'div.embed-issuu': embedIssuu,
	'a[href^="http://"], a[href^="https://"]': embedLink, // process plain links last
};

const cacheBustQuery = `?v=${ Math.floor( new Date().getTime() / ( 1000 * 60 * 60 * 24 * 10 ) ) }`; // A new query every 10 days

const SLIDESHOW_URLS = {
	CSS: `https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/shortcodes/css/slideshow-shortcode.css${ cacheBustQuery }`,
	CYCLE_JS: `https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/shortcodes/js/jquery.cycle.min.js${ cacheBustQuery }`,
	JS: `https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/shortcodes/js/slideshow-shortcode.js${ cacheBustQuery }`,
	SPINNER: `https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/shortcodes/img/slideshow-loader.gif${ cacheBustQuery }`,
};

// Characters that let an attribute value escape its attribute, or open an element, when the
// value is written back into an HTML string.
const UNSAFE_IN_ATTRIBUTE_VALUE = /["'<>]/;

// Data attributes that legitimately carry a quoted payload and reach text-only sinks: the
// carousel metadata the post normalizer reads, and the caption/title markup the gallery
// components strip before rendering.
const DATA_ATTRIBUTES_ALLOWED_TO_CONTAIN_MARKUP = [
	'data-carousel-extra',
	'data-image-caption',
	'data-image-description',
	'data-image-meta',
	'data-image-title',
];

/**
 * Remove any markup from a Jetpack slideshow payload.
 *
 * A slideshow is described by a JSON array in data-gallery, so the attribute has to keep its
 * quotes to stay parseable. The shortcode script assigns each slide's caption to innerHTML, so
 * the captions are the one part of that payload that is parsed as markup.
 *
 * A slide is rebuilt as a flat record of primitives. Dropping the nested values matters as much
 * as flattening the captions: innerHTML takes a string, so an array of markup would be joined
 * straight back into the markup it holds.
 * @param {string} value the raw data-gallery attribute value
 * @returns {string|null} an equivalent payload with inert captions, or null if unparseable
 */
function sanitizeSlideshowGallery( value ) {
	let gallery;

	try {
		gallery = JSON.parse( value );
	} catch ( e ) {
		return null;
	}

	if ( ! Array.isArray( gallery ) ) {
		return null;
	}

	return JSON.stringify( gallery.map( sanitizeSlideshowSlide ) );
}

/**
 * @param {unknown} slide one entry of a data-gallery payload
 * @returns {Object} the slide reduced to primitive fields, with any caption flattened to text
 */
function sanitizeSlideshowSlide( slide ) {
	if ( ! slide || typeof slide !== 'object' ) {
		return {};
	}

	return Object.fromEntries(
		Object.entries( slide )
			.filter( ( [ , field ] ) => typeof field !== 'object' )
			.map( ( [ name, field ] ) =>
				name === 'caption' && typeof field === 'string'
					? [ name, field.replace( /<[^>]*>/g, '' ) ]
					: [ name, field ]
			)
	);
}

/**
 * Make an embed's data attributes safe to read back out of the DOM.
 *
 * Embed runtimes read their configuration with getAttribute(), which returns the entity-decoded
 * value, and several of them interpolate the result into an HTML string that the browser parses
 * a second time. A value holding a quote therefore closes the attribute the runtime was building
 * and can introduce an event handler that never existed in the post content. Post content is
 * author controlled, so the values have to be safe before any runtime sees them.
 *
 * This sweeps the whole content subtree rather than the nodes our own selectors matched: the
 * runtimes we load scan the document for their own markers, so a node Calypso never dispatched
 * is still reachable once a sibling embed has pulled the script in.
 * @param {window.Element} domNode a subtree of post content
 */
function removeUnsafeEmbedAttributes( domNode ) {
	[ domNode, ...domNode.querySelectorAll( '*' ) ].forEach( ( node ) => {
		Array.from( node.attributes ).forEach( ( { name, value } ) => {
			if ( ! name.startsWith( 'data-' ) ) {
				return;
			}

			if ( name === 'data-gallery' ) {
				const sanitized = sanitizeSlideshowGallery( value );
				if ( sanitized === null ) {
					node.removeAttribute( name );
				} else if ( sanitized !== value ) {
					node.setAttribute( name, sanitized );
				}
				return;
			}

			if ( DATA_ATTRIBUTES_ALLOWED_TO_CONTAIN_MARKUP.includes( name ) ) {
				return;
			}

			if ( ! UNSAFE_IN_ATTRIBUTE_VALUE.test( value ) ) {
				return;
			}

			debug( 'removing unsafe attribute %s from', name, node );
			node.removeAttribute( name );
		} );
	} );
}

function processEmbeds( domNode ) {
	removeUnsafeEmbedAttributes( domNode );

	Object.entries( embedsToLookFor ).forEach( ( [ embedSelector, fn ] ) => {
		const nodes = domNode.querySelectorAll( embedSelector );
		Array.from( nodes ).filter( nodeNeedsProcessing ).forEach( fn );
	} );
}

function nodeNeedsProcessing( domNode ) {
	if ( domNode.hasAttribute( 'data-wpcom-embed-processed' ) ) {
		return false; // already marked for processing
	}

	domNode.setAttribute( 'data-wpcom-embed-processed', '1' );
	return true;
}

function loadCSS( cssUrl ) {
	const link = document.createElement( 'link' );

	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = cssUrl;

	document.head.appendChild( link );
}

const loaders = {};
function loadAndRun( scriptUrl, callback ) {
	let loader = loaders[ scriptUrl ];
	if ( ! loader ) {
		loader = new Promise( function ( resolve, reject ) {
			loadScript( scriptUrl, function ( err ) {
				if ( err ) {
					reject( err );
				} else {
					resolve();
				}
			} );
		} );
		loaders[ scriptUrl ] = loader;
	}
	loader.then( callback, function ( err ) {
		debug( 'error loading ' + scriptUrl, err );
		loaders[ scriptUrl ] = null;
	} );
}

function embedInstagram( domNode ) {
	debug( 'processing instagram for', domNode );
	if ( typeof instgrm !== 'undefined' ) {
		try {
			window.instgrm.Embeds.process();
		} catch ( e ) {}
		return;
	}

	loadAndRun(
		'https://platform.instagram.com/en_US/embeds.js',
		embedInstagram.bind( null, domNode )
	);
}

function embedTwitter( domNode ) {
	debug( 'processing twitter for', domNode );

	if ( typeof twttr !== 'undefined' ) {
		try {
			window.twttr.widgets.load( domNode );
		} catch ( e ) {}
		return;
	}

	loadAndRun( 'https://platform.twitter.com/widgets.js', embedTwitter.bind( null, domNode ) );
}

function embedLink( domNode ) {
	debug( 'processing link for', domNode );
	domNode.setAttribute( 'target', '_blank' );
}

function embedFacebook( domNode ) {
	debug( 'processing facebook for', domNode );
	if ( typeof fb !== 'undefined' ) {
		return;
	}

	loadAndRun( 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.2', noop );
}

function embedIssuu( domNode ) {
	debug( 'processing Issuu for', domNode );

	loadAndRun( '//e.issuu.com/embed.js', noop );
}

function embedPinterest( domNode ) {
	debug( 'processing Pinterest for', domNode );
	if ( window.PinUtils ) {
		window.PinUtils.build?.();
	} else {
		loadAndRun( '//assets.pinterest.com/js/pinit.js', noop );
	}
}

function embedReddit( domNode ) {
	debug( 'processing reddit for ', domNode );
	loadAndRun( 'https://embed.redditmedia.com/widgets/platform.js', noop );
}

function embedTikTok( domNode ) {
	debug( 'processing tiktok for ', domNode );
	loadAndRun( 'https://www.tiktok.com/embed.js', noop );
}

function embedWordPressPost( domNode ) {
	debug( 'processing WordPress for ', domNode );
	loadAndRun( 'https://wordpress.com/wp-includes/js/wp-embed.min.js', noop );
}

let tumblrLoader;
function embedTumblr( domNode ) {
	debug( 'processing tumblr for', domNode );
	if ( tumblrLoader ) {
		return;
	}

	// tumblr just wants us to load this script, over and over and over
	tumblrLoader = true;

	function removeScript() {
		Array.from(
			document.querySelectorAll( 'script[src="https://secure.assets.tumblr.com/post.js"]' )
		).forEach( function ( el ) {
			el.parentNode.removeChild( el );
		} );
		tumblrLoader = false;
	}

	setTimeout( function () {
		loadScript( 'https://secure.assets.tumblr.com/post.js', removeScript );
	}, 30 );
}

function triggerJQueryLoadEvent() {
	// force JetpackSlideshow to initialize, in case navigation hasn't caused ready event on document
	window.jQuery( 'body' ).trigger( 'post-load' );
}

function createSlideshow() {
	if ( window.JetpackSlideshow ) {
		triggerJQueryLoadEvent();
	}

	loadAndRun( SLIDESHOW_URLS.JS, () => {
		triggerJQueryLoadEvent();
	} );
}

function embedSlideshow( domNode ) {
	debug( 'processing slideshow for', domNode );

	let slideshowCSSPresent = document.head.querySelector( `link[href="${ SLIDESHOW_URLS.CSS }"]` );
	// set global variable required by JetpackSlideshow
	window.jetpackSlideshowSettings = {
		spinner: SLIDESHOW_URLS.SPINNER,
	};

	if ( ! slideshowCSSPresent ) {
		slideshowCSSPresent = true;
		loadCSS( SLIDESHOW_URLS.CSS );
	}

	// Remove no JS warning so user doesn't have to look at it while several scripts load
	const warningElements = domNode.parentNode.getElementsByClassName( 'jetpack-slideshow-noscript' );
	Array.from( warningElements ).forEach( ( el ) => {
		el.classList.add( 'hidden' );
	} );

	if ( window.jQuery && window.jQuery.prototype.cycle ) {
		// jQuery and cylcejs exist
		createSlideshow();
	} else if ( window.jQuery && ! window.jQuery.prototype.cycle ) {
		// Only jQuery exists
		loadAndRun( SLIDESHOW_URLS.CYCLE_JS, () => {
			createSlideshow();
		} );
	} else {
		// Neither exist
		loadjQueryDependentScript( SLIDESHOW_URLS.CYCLE_JS, () => {
			createSlideshow();
		} );
	}
}

function embedCarousel( domNode ) {
	debug( 'processing carousel for ', domNode );

	const carouselItemsWrapper = domNode.querySelector( '.swiper-wrapper' );

	// Inject the DotPager component.
	if ( carouselItemsWrapper ) {
		const carouselItems = Array.from( carouselItemsWrapper?.children );

		if ( carouselItems && carouselItems.length ) {
			createRoot( domNode ).render(
				<DotPager>
					{ carouselItems.map( ( item, index ) => {
						return (
							<div
								key={ index }
								className={ clsx( 'carousel-slide', item?.className ) }
								// eslint-disable-next-line react/no-danger
								dangerouslySetInnerHTML={ { __html: item?.innerHTML } }
							/>
						);
					} ) }
				</DotPager>
			);
		}
	}
}

function embedStory( domNode ) {
	debug( 'processing story for ', domNode );

	// wp-story-overlay is here for backwards compatiblity with Stories on Jetpack 9.7 and below.
	const storyLink = domNode.querySelector( 'a.wp-story-container, a.wp-story-overlay' );

	// Open story in a new tab
	if ( storyLink ) {
		storyLink.setAttribute( 'target', '_blank' );
	}
}

function embedTiledGallery( domNode ) {
	debug( 'processing tiled gallery for', domNode );
	const galleryItems = domNode.getElementsByClassName( 'tiled-gallery__item' );

	if ( galleryItems && galleryItems.length ) {
		const imageItems = Array.from( galleryItems );

		// Replace the gallery with updated markup
		createRoot( domNode ).render(
			<div className="gallery-container">
				{ imageItems.map( ( item, index ) => {
					const itemImage = item.querySelector( 'img' );
					const itemLink = item.querySelector( 'a' );

					const imageElement = (
						<img
							id={ itemImage?.id || undefined }
							className={ itemImage?.className || undefined }
							alt={ itemImage?.alt || '' }
							src={ itemImage?.src || undefined }
							srcSet={ itemImage?.srcSet || undefined }
						/>
					);

					return (
						<figure key={ index } className="gallery-item">
							<div className="gallery-item-wrapper">
								{ itemLink?.href ? <a href={ itemLink.href }>{ imageElement }</a> : imageElement }
							</div>
						</figure>
					);
				} ) }
			</div>
		);

		// Add carousel functionality after React rendering
		setTimeout( () => {
			const newGalleryItems = domNode.querySelectorAll( '.gallery-item' );
			addImageCarousel( newGalleryItems );
		}, 0 );
	}
}

function embedGallery( domNode ) {
	debug( 'processing gallery for', domNode );
	const imageBlocks = domNode.querySelectorAll( '.wp-block-image' );

	if ( imageBlocks && imageBlocks.length > 0 ) {
		// Add carousel functionality to images
		addImageCarousel( imageBlocks );
	}
}

/**
 * A component that notices when the content has embeds that require outside JS. Load the outside JS and process the embeds
 */
export default class EmbedContainer extends PureComponent {
	startMarkerRef = createRef();
	endMarkerRef = createRef();

	getContentNodes = () => {
		const nodes = [];
		const endMarker = this.endMarkerRef.current;
		let node = this.startMarkerRef.current?.nextSibling;

		while ( node && node !== endMarker ) {
			if ( node.nodeType === 1 ) {
				nodes.push( node );
			}
			node = node.nextSibling;
		}

		return nodes;
	};

	processEmbeds = () => {
		this.getContentNodes().forEach( processEmbeds );
	};

	componentDidMount() {
		this.processEmbeds();
	}
	componentDidUpdate() {
		this.processEmbeds();
	}
	componentWillUnmount() {
		// Unmark the contents as done because they may not be on the following re-render.
		this.getContentNodes().forEach( ( domNode ) => {
			domNode.querySelectorAll( '[data-wpcom-embed-processed]' ).forEach( ( node ) => {
				node.removeAttribute( 'data-wpcom-embed-processed' );
			} );
		} );
	}
	render() {
		return (
			<>
				<template ref={ this.startMarkerRef } />
				{ this.props.children }
				<template ref={ this.endMarkerRef } />
			</>
		);
	}
}
