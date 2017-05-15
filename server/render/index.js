/**
 * External dependencies
 */
import ReactDomServer from 'react-dom/server';
import superagent from 'superagent';
import Lru from 'lru';
import { isEmpty, pick } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { isSectionIsomorphic } from 'state/ui/selectors';
import {
	getDocumentHeadFormattedTitle,
	getDocumentHeadMeta,
	getDocumentHeadLink
} from 'state/document-head/selectors';
import { reducer } from 'state';
import { SERIALIZE } from 'state/action-types';
import stateCache from 'state-cache';

const debug = debugFactory( 'calypso:server-render' );
const HOUR_IN_MS = 3600000;
const markupCache = new Lru( {
	max: 3000,
	maxAge: HOUR_IN_MS
} );

function bumpStat( group, name ) {
	const statUrl = `http://pixel.wp.com/g.gif?v=wpcom-no-pv&x_${ group }=${ name }&t=${ Math.random() }`;

	if ( config( 'env' ) === 'production' ) {
		superagent.get( statUrl ).end();
	}
}

/**
* Render and cache supplied React element to a markup string.
* Cache is keyed by stringified element by default.
*
* @param {object} element - React element to be rendered to html
* @param {string} key - (optional) custom key
* @return {string} The rendered Layout
*/
export function render( element, key = JSON.stringify( element ) ) {
	try {
		const startTime = Date.now();
		debug( 'cache access for key', key );

		let renderedLayout = markupCache.get( key );
		if ( ! renderedLayout ) {
			bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
			debug( 'cache miss for key', key );
			renderedLayout = ReactDomServer.renderToString( element );
			markupCache.set( key, renderedLayout );
		}
		const rtsTimeMs = Date.now() - startTime;
		debug( 'Server render time (ms)', rtsTimeMs );

		if ( rtsTimeMs > 100 ) {
			// Server renders should probably never take longer than 100ms
			bumpStat( 'calypso-ssr', 'over-100ms-rendertostring' );
		}

		return renderedLayout;
	} catch ( ex ) {
		if ( config( 'env' ) === 'development' ) {
			throw ex;
		}
	}
	//todo: render an error?
}

export function serverRender( req, res ) {
	const context = req.context;
	let title, metas = [], links = [];

	if ( context.lang !== config( 'i18n_default_locale_slug' ) ) {
		context.i18nLocaleScript = '//widgets.wp.com/languages/calypso/' + context.lang + '.js';
	}

	if ( config.isEnabled( 'server-side-rendering' ) && context.layout && ! context.user && isEmpty( context.query ) ) {
		// context.pathname doesn't include querystring, so it's a suitable cache key.
		let key = context.pathname;
		if ( req.error ) {
			key = req.error.message;
		}
		context.renderedLayout = render( context.layout, key );
	}

	if ( context.store ) {
		title = getDocumentHeadFormattedTitle( context.store.getState() );
		metas = getDocumentHeadMeta( context.store.getState() );
		links = getDocumentHeadLink( context.store.getState() );

		let reduxSubtrees = [ 'documentHead' ];
		// Send redux state only in logged-out scenario
		if ( isSectionIsomorphic( context.store.getState() ) && ! context.user ) {
			reduxSubtrees = reduxSubtrees.concat( [ 'ui', 'themes' ] );
		}

		// Send state to client
		context.initialReduxState = pick( context.store.getState(), reduxSubtrees );
		// And cache on the server, too
		if ( isEmpty( context.query ) ) {
			// Don't cache if we have query params
			const serverState = reducer( context.initialReduxState, { type: SERIALIZE } );
			stateCache.set( context.pathname, serverState );
		}
	}

	context.head = { title, metas, links };
	context.config = config.ssrConfig;

	if ( config.isEnabled( 'desktop' ) ) {
		res.render( 'desktop.jade', context );
	} else {
		res.render( 'index.jade', context );
	}
}
