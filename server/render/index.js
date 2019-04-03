/** @format */

/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';
import superagent from 'superagent';
import Lru from 'lru';
import { get, pick } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { isDefaultLocale } from 'lib/i18n-utils';
import { getLanguageFileUrl } from 'lib/i18n-utils/switch-locale';
import { isSectionIsomorphic } from 'state/ui/selectors';
import {
	getDocumentHeadFormattedTitle,
	getDocumentHeadMeta,
	getDocumentHeadLink,
} from 'state/document-head/selectors';
import isRTL from 'state/selectors/is-rtl';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import getCurrentLocaleVariant from 'state/selectors/get-current-locale-variant';
import initialReducer from 'state/reducer';
import { SERIALIZE } from 'state/action-types';
import stateCache from 'state-cache';
import { getNormalizedPath } from 'isomorphic-routing';
import { logToLogstash } from 'state/logstash/actions';

const debug = debugFactory( 'calypso:server-render' );
const HOUR_IN_MS = 3600000;
const markupCache = new Lru( {
	max: 3000,
	maxAge: HOUR_IN_MS,
} );

function bumpStat( group, name ) {
	const statUrl = `http://pixel.wp.com/g.gif?v=wpcom-no-pv&x_${ group }=${ name }&t=${ Math.random() }`;

	if ( process.env.NODE_ENV === 'production' ) {
		superagent.get( statUrl ).end();
	}
}

/**
 * Render JSX template to a markup string.
 *
 * @param {string} view - JSX template to render (basename)
 * @param {object} props - Properties which got passed to the JSX template
 * @return {string} Rendered markup
 */
export function renderJsx( view, props ) {
	const requireComponent = require.context( '../../client/document', true, /\.jsx$/ );
	const component = requireComponent( './' + view + '.jsx' ).default;
	const doctype = `<!DOCTYPE html><!--
	<3
	             _
	    ___ __ _| |_   _ _ __  ___  ___
	   / __/ _\` | | | | | '_ \\/ __|/ _ \\
	  | (_| (_| | | |_| | |_) \\__ \\ (_) |
	   \\___\\__,_|_|\\__, | .__/|___/\\___/
	               |___/|_|

	to join the fun, visit: https://automattic.com/work-with-us/

-->`;
	return doctype + ReactDomServer.renderToStaticMarkup( React.createElement( component, props ) );
}

/**
 * Render and cache supplied React element to a markup string.
 * Cache is keyed by stringified element by default.
 *
 * @param {object} element - React element to be rendered to html
 * @param {string} key - (optional) custom key
 * @param {object} req - Request object
 * @return {string} The rendered Layout
 */
export function render( element, key = JSON.stringify( element ), req ) {
	try {
		const startTime = Date.now();
		debug( 'cache access for key', key );

		let renderedLayout = markupCache.get( key );
		if ( ! renderedLayout ) {
			bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
			debug( 'cache miss for key', key );
			if (
				( config.isEnabled( 'ssr/sample-log-cache-misses' ) && Math.random() < 0.001 ) ||
				config.isEnabled( 'ssr/always-log-cache-misses' )
			) {
				// Log 0.1% of cache misses
				req.context.store.dispatch(
					logToLogstash( {
						feature: 'calypso_ssr',
						message: 'render cache miss',
						extra: {
							key,
							'existing-keys': markupCache.keys,
							'user-agent': get( req.headers, 'user-agent', '' ),
							path: req.context.path,
						},
					} )
				);
			}
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
		if ( process.env.NODE_ENV === 'development' ) {
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

	if ( ! isDefaultLocale( context.lang ) ) {
		const langFileName = getCurrentLocaleVariant( context.store.getState() ) || context.lang;

		context.i18nLocaleScript = getLanguageFileUrl( langFileName, 'js', context.languageRevisions );
	}

	if ( shouldServerSideRender( context ) ) {
		cacheKey = getNormalizedPath( context.pathname, context.query );
		context.renderedLayout = render(
			context.layout,
			req.error ? req.error.message : cacheKey,
			req
		);
	}

	if ( context.store ) {
		title = getDocumentHeadFormattedTitle( context.store.getState() );
		metas = getDocumentHeadMeta( context.store.getState() );
		links = getDocumentHeadLink( context.store.getState() );

		const cacheableReduxSubtrees = [ 'documentHead' ];
		const isomorphicSubtrees = isSectionIsomorphic( context.store.getState() )
			? [ 'themes', 'ui' ]
			: [];

		const reduxSubtrees = [ ...cacheableReduxSubtrees, ...isomorphicSubtrees ];

		// Send state to client
		context.initialReduxState = pick( context.store.getState(), reduxSubtrees );

		// And cache on the server, too.
		if ( cacheKey ) {
			const cacheableInitialState = pick( context.store.getState(), cacheableReduxSubtrees );
			const serverState = initialReducer( cacheableInitialState, { type: SERIALIZE } );
			stateCache.set( cacheKey, serverState );
		}

		context.lang = getCurrentLocaleSlug( context.store.getState() ) || context.lang;

		const isLocaleRTL = isRTL( context.store.getState() );
		context.isRTL = isLocaleRTL !== null ? isLocaleRTL : context.isRTL;
	}

	context.head = { title, metas, links };
	context.clientData = config.clientData;
	try {
		context.buildTimestamp = BUILD_TIMESTAMP;
	} catch ( e ) {
		context.buildTimestamp = null;
		debug( 'BUILD_TIMESTAMP is not defined for wp-desktop builds and is expected to fail here.' );
	}

	if ( config.isEnabled( 'desktop' ) ) {
		res.send( renderJsx( 'desktop', context ) );
		return;
	}

	res.send( renderJsx( 'index', context ) );
}

/**
 * The fallback middleware which ensures we have value for context.serverSideRender (the most common value). This is
 * executed early in the chain, but the section-specific middlewares may decide to override the value based on their
 * own logic. For example, some sections may decide to enable SSRing when some specific query arguments exist or
 * have a specific format. @see setShouldServerSideRenderLogin
 *
 * Warning: Having context.serverSideRender=true is not sufficient for performing SSR. The app-level checks are also
 * applied before truly SSRing (@see isServerSideRenderCompatible)
 *
 * @param {object}   context  The entire request context
 * @param {function} next     As all middlewares, will call next in the sequence
 */
export function setShouldServerSideRender( context, next ) {
	context.serverSideRender = Object.keys( context.query ).length === 0; // no SSR when we have query args

	next();
}

/**
 * Applies all the app-related checks for server side rendering.
 *
 * Note: This is designed to include only the global/app checks. Section specific criteria must be handled by
 * section-specific middlewares, which have the responsibility to write a boolean value to context.serverSideRender
 * (@see setShouldServerSideRender and @see setShouldServerSideRenderLogin).
 *
 * Warning: If this returns true, it is not sufficient for the page to be SSRed. Returning true from here is a
 * pre-condition for SSR and the result needs to be corroborated with context.serverSideRender
 * (context.serverSideRender is set to boolean by the middlewares, depending, in general, on the query params).
 *
 * Warning: if you think about calling this method or adding these conditions to the middlewares themselves (the ones
 * that set context.serverSideRender), think twice: the context may not be populated with all the necessary values
 * when the sections-specific middlewares are run (examples: context.layout, context.user).
 *
 * @param {object}   context The currently built context
 *
 * @return {boolean} True if all the app-level criteria are fulfilled.
 */
function isServerSideRenderCompatible( context ) {
	return Boolean(
		isSectionIsomorphic( context.store.getState() ) &&
		! context.user && // logged out only
			isDefaultLocale( context.lang ) &&
			context.layout
	);
}

/**
 * The main entry point for server-side rendering checks, and the final authority if a page should be SSRed.
 *
 * Warning: the context needs to be 'ready' for these checks (needs to have all values)
 *
 * @param {object}   context The currently built context
 * @return {boolean} if the current page/request should return a SSR response
 */
export function shouldServerSideRender( context ) {
	return Boolean(
		config.isEnabled( 'server-side-rendering' ) &&
			isServerSideRenderCompatible( context ) &&
			context.serverSideRender === true
	);
}
