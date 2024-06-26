import { loadScript, loadjQueryDependentScript } from '@automattic/load-script';
import clsx from 'clsx';
import debugFactory from 'debug';
import { filter, forEach } from 'lodash';
import { PureComponent } from 'react';
import ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import DotPager from '../dot-pager';

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

function processEmbeds( domNode ) {
	Object.entries( embedsToLookFor ).forEach( ( [ embedSelector, fn ] ) => {
		const nodes = domNode.querySelectorAll( embedSelector );
		forEach( filter( nodes, nodeNeedsProcessing ), fn );
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
		forEach(
			document.querySelectorAll( 'script[src="https://secure.assets.tumblr.com/post.js"]' ),
			function ( el ) {
				el.parentNode.removeChild( el );
			}
		);
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
	forEach( warningElements, ( el ) => {
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
				{ imageItems.map( ( item ) => {
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
						<figure className="gallery-item">
							<div className="gallery-item-wrapper">
								{ itemLink?.href ? <a href={ itemLink.href }>{ imageElement }</a> : imageElement }
							</div>
						</figure>
					);
				} ) }
			</div>
		);
	}
}

/**
 * A component that notices when the content has embeds that require outside JS. Load the outside JS and process the embeds
 */
export default class EmbedContainer extends PureComponent {
	componentDidMount() {
		processEmbeds( ReactDom.findDOMNode( this ) );
	}
	componentDidUpdate() {
		processEmbeds( ReactDom.findDOMNode( this ) );
	}
	componentWillUnmount() {
		// Unmark the contents as done because they may not be on the following re-render.
		ReactDom.findDOMNode( this )
			.querySelectorAll( '[data-wpcom-embed-processed]' )
			.forEach( ( node ) => {
				node.removeAttribute( 'data-wpcom-embed-processed' );
			} );
	}
	render() {
		return this.props.children;
	}
}
