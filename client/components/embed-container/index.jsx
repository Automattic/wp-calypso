/**
 * A component that notices when the content has embeds that require outside JS. Load the outside JS and process the embeds
 */

import React from 'react';
import ReactDom from 'react-dom';
import PureMixin from 'react-pure-render/mixin';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';

import { loadScript } from 'lib/load-script';

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:components:embed-container' );

const embedsToLookFor = {
	'blockquote[class^="instagram-"]': embedInstagram,
	'blockquote[class^="twitter-"]': embedTwitter,
	'fb\\\:post, [class^=fb-]': embedFacebook
};

function processEmbeds( domNode ) {
	forOwn( embedsToLookFor, ( fn, embedSelector ) => {
		let nodes = domNode.querySelectorAll( embedSelector );
		forEach( nodes, fn );
	} );
}

let instagramLoader;
function embedInstagram( domNode ) {
	debug( 'processing instagram for', domNode );
	if ( domNode.hasAttribute( 'data-wpcom-embed-processed' ) ) {
		return; // already marked for processing
	}

	domNode.setAttribute( 'data-wpcom-embed-processed', '1' );

	if ( typeof instgrm !== 'undefined' ) {
		global.instgrm.Embeds.process();
		return;
	}

	if ( ! instagramLoader ) {
		instagramLoader = new Promise( function( resolve, reject ) {
			loadScript( 'https://platform.instagram.com/en_US/embeds.js', function( err ) {
				if ( err ) {
					reject( err );
				} else {
					resolve();
				}
			} );
		} );
	}

	instagramLoader.then(
		embedInstagram.bind( null, domNode ),
		debug.bind( null, 'Could not load instagram platform' )
	);
}

let twitterLoader;
function embedTwitter( domNode ) {
	debug( 'processing twitter for', domNode );
	if ( domNode.hasAttribute( 'data-wpcom-embed-processed' ) ) {
		return; // already marked for processing
	}

	domNode.setAttribute( 'data-wpcom-embed-processed', '1' );

	if ( typeof twttr !== 'undefined' ) {
		global.twttr.widgets.load( domNode );
		return;
	}

	if ( ! twitterLoader ) {
		twitterLoader = new Promise( function( resolve, reject ) {
			loadScript( 'https://platform.twitter.com/widgets.js', function( err ) {
				if ( err ) {
					reject( err );
				} else {
					resolve();
				}
			} );
		} );
	}

	twitterLoader.then(
		embedTwitter.bind( null, domNode ),
		debug.bind( null, 'Could not load twitter platform' )
	);
}

let fbLoader;
function embedFacebook( domNode ) {
	debug( 'processing twitter for', domNode );
	if ( domNode.hasAttribute( 'data-wpcom-embed-processed' ) ) {
		return; // already marked for processing
	}

	domNode.setAttribute( 'data-wpcom-embed-processed', '1' );

	if ( typeof fb !== 'undefined' ) {
		return;
	}

	if ( ! fbLoader ) {
		fbLoader = new Promise( function( resolve, reject ) {
			loadScript( 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.2', function( err ) {
				if ( err ) {
					reject( err );
				} else {
					resolve();
				}
			} );
		} );
	}

	fbLoader.then(
		embedFacebook.bind( null, domNode ),
		debug.bind( null, 'Could not load twitter platform' )
	);
}

export default React.createClass( {
	mixins: [ PureMixin ],

	componentDidMount() {
		debug( 'did mount' );
		processEmbeds( ReactDom.findDOMNode( this ) );
	},

	componentDidUpdate() {
		debug( 'did update' );
		processEmbeds( ReactDom.findDOMNode( this ) );
	},

	componentWillUnmount() {
		debug( 'unmounting' );
	},

	render() {
		return React.Children.only( this.props.children );
	}
} );
