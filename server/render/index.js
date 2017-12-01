/** @format */

/**
 * External dependencies
 */
import ReactDomServer from 'react-dom/server';
import superagent from 'superagent';
import Lru from 'lru';
import { pick } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { isDefaultLocale } from 'lib/i18n-utils';
import { isSectionIsomorphic } from 'state/ui/selectors';
import {
	getDocumentHeadFormattedTitle,
	getDocumentHeadMeta,
	getDocumentHeadLink,
} from 'state/document-head/selectors';
import isRTL from 'state/selectors/is-rtl';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import { reducer } from 'state';
import { SERIALIZE } from 'state/action-types';
import stateCache from 'state-cache';
import { getCacheKey } from 'isomorphic-routing';

const debug = debugFactory( 'calypso:server-render' );
const HOUR_IN_MS = 3600000;
const markupCache = new Lru( {
	max: 3000,
	maxAge: HOUR_IN_MS,
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
	let title,
		metas = [],
		links = [],
		cacheKey = false;

	if ( isSectionIsomorphic( context.store.getState() ) && ! context.user ) {
		cacheKey = getCacheKey( context );
	}

	if ( ! isDefaultLocale( context.lang ) ) {
		context.i18nLocaleScript = '//widgets.wp.com/languages/calypso/' + context.lang + '.js';
	}

	if (
		config.isEnabled( 'server-side-rendering' ) &&
		context.layout &&
		! context.user &&
		cacheKey &&
		isDefaultLocale( context.lang )
	) {
		context.renderedLayout = render( context.layout, req.error ? req.error.message : cacheKey );
	}

	if ( context.store ) {
		title = getDocumentHeadFormattedTitle( context.store.getState() );
		metas = getDocumentHeadMeta( context.store.getState() );
		links = getDocumentHeadLink( context.store.getState() );

		const cacheableReduxSubtrees = [ 'documentHead' ];
		let reduxSubtrees;

		if ( isSectionIsomorphic( context.store.getState() ) ) {
			reduxSubtrees = cacheableReduxSubtrees.concat( [ 'ui', 'themes' ] );
		} else {
			reduxSubtrees = cacheableReduxSubtrees;
		}

		// Send state to client
		context.initialReduxState = pick( context.store.getState(), reduxSubtrees );

		// And cache on the server, too.
		if ( cacheKey ) {
			const cacheableInitialState = pick( context.store.getState(), cacheableReduxSubtrees );
			const serverState = reducer( cacheableInitialState, { type: SERIALIZE } );
			stateCache.set( cacheKey, serverState );
		}

		context.lang = getCurrentLocaleSlug( context.store.getState() ) || context.lang;
		const isLocaleRTL = isRTL( context.store.getState() );
		context.isRTL = isLocaleRTL !== null ? isLocaleRTL : context.isRTL;
	}

	context.head = { title, metas, links };
	context.config = config.ssrConfig;

	if ( config.isEnabled( 'desktop' ) ) {
		res.render( 'desktop', context );
	} else {
		res.render( 'index', context );
	}
}

export function serverRenderError( err, req, res, next ) {
	if ( err ) {
		if ( config( 'env' ) !== 'production' ) {
			console.error( err );
		}
		req.error = err;
		res.status( err.status || 500 );
		res.render( '500', req.context );
		return;
	}

	next();
}
