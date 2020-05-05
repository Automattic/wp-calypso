/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import ReactDom from 'react-dom';
import { assign, filter, forEach, forOwn, noop } from 'lodash';

/**
 * Internal Dependencies
 */
import { loadScript } from '@automattic/load-script';
import { loadjQueryDependentScriptDesktopWrapper } from 'lib/load-jquery-dependent-script-desktop-wrapper';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:components:embed-container' );

const embedsToLookFor = {
	'blockquote[class^="instagram-"]': embedInstagram,
	'blockquote[class^="twitter-"], a[class^="twitter-"]': embedTwitter,
	'fb\\:post, [class^=fb-]': embedFacebook,
	'[class^=tumblr-]': embedTumblr,
	'.jetpack-slideshow': embedSlideshow,
	'.embed-reddit': embedReddit,
};

const cacheBustQuery = `?v=${ Math.floor( new Date().getTime() / ( 1000 * 60 * 60 * 24 * 10 ) ) }`; // A new query every 10 days

const SLIDESHOW_URLS = {
	CSS: `https://s0.wp.com/wp-content/mu-plugins/shortcodes/css/slideshow-shortcode.css${ cacheBustQuery }`,
	CYCLE_JS: `https://s0.wp.com/wp-content/mu-plugins/shortcodes/js/jquery.cycle.min.js${ cacheBustQuery }`,
	JS: `https://s0.wp.com/wp-content/mu-plugins/shortcodes/js/slideshow-shortcode.js${ cacheBustQuery }`,
	SPINNER: `https://s0.wp.com/wp-content/mu-plugins/shortcodes/img/slideshow-loader.gif${ cacheBustQuery }`,
};

function processEmbeds( domNode ) {
	forOwn( embedsToLookFor, ( fn, embedSelector ) => {
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
	const link = assign( document.createElement( 'link' ), {
		rel: 'stylesheet',
		type: 'text/css',
		href: cssUrl,
	} );

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

function embedFacebook( domNode ) {
	debug( 'processing facebook for', domNode );
	if ( typeof fb !== 'undefined' ) {
		return;
	}

	loadAndRun( 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.2', noop );
}

function embedReddit( domNode ) {
	debug( 'processing reddit for ', domNode );
	loadAndRun( 'https://embed.redditmedia.com/widgets/platform.js', noop );
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

let slideshowCSSPresent = document.head.querySelector( `link[href="${ SLIDESHOW_URLS.CSS }"]` );

function embedSlideshow( domNode ) {
	debug( 'processing slideshow for', domNode );

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
		loadjQueryDependentScriptDesktopWrapper( SLIDESHOW_URLS.CYCLE_JS, () => {
			createSlideshow();
		} );
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

	render() {
		return React.Children.only( this.props.children );
	}
}
