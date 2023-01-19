import fs from 'fs';
import path from 'path';
import config from '@automattic/calypso-config';
import { isDefaultLocale, isTranslatedIncompletely } from '@automattic/i18n-utils';
import debugFactory from 'debug';
import { get, pick } from 'lodash';
import Lru from 'lru';
import { createElement } from 'react';
import ReactDomServer from 'react-dom/server';
import superagent from 'superagent';
import { logServerEvent } from 'calypso/lib/analytics/statsd-utils';
import {
	getLanguageFileUrl,
	getLanguageManifestFileUrl,
	getTranslationChunkFileUrl,
} from 'calypso/lib/i18n-utils/switch-locale';
import { getCacheKey } from 'calypso/server/isomorphic-routing';
import performanceMark from 'calypso/server/lib/performance-mark';
import stateCache from 'calypso/server/state-cache';
import {
	getDocumentHeadFormattedTitle,
	getDocumentHeadMeta,
	getDocumentHeadLink,
} from 'calypso/state/document-head/selectors';
import { dehydrateQueryClient } from 'calypso/state/query-client-ssr';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentLocaleVariant from 'calypso/state/selectors/get-current-locale-variant';
import { serialize } from 'calypso/state/utils';

const debug = debugFactory( 'calypso:server-render' );
const HOUR_IN_MS = 3600000;
export const markupCache = new Lru( {
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
 * @param {Object} props - Properties which got passed to the JSX template
 * @returns {string} Rendered markup
 */
export function renderJsx( view, props ) {
	const requireComponent = require.context( 'calypso/document', true, /\.jsx$/ );
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
	return doctype + ReactDomServer.renderToStaticMarkup( createElement( component, props ) );
}

/**
 * Render and cache supplied React element to a markup string.
 * Cache is keyed by stringified element by default.
 *
 * @param {Object} element - React element to be rendered to html
 * @param {string} key - cache key
 * @param {Object} req - Request object
 * @returns {string|undefined} The rendered Layout
 */
function render( element, key, req ) {
	try {
		const startTime = Date.now();
		debug( 'cache access for key', key );

		// If the cached layout was stored earlier in the request, no need to get it again.
		let renderedLayout = req.context.cachedMarkup ?? markupCache.get( key );
		const markupFromCache = !! renderedLayout; // Store this before updating renderedLayout.
		if ( ! renderedLayout ) {
			bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
			debug( 'cache miss for key', key );
			if (
				( config.isEnabled( 'ssr/sample-log-cache-misses' ) && Math.random() < 0.001 ) ||
				config.isEnabled( 'ssr/always-log-cache-misses' )
			) {
				// Log 0.1% of cache misses
				req.logger.warn( {
					feature: 'calypso_ssr',
					message: 'render cache miss',
					extra: {
						key,
						'existing-keys': markupCache.keys,
						'user-agent': get( req.headers, 'user-agent', '' ),
						path: req.context.path,
					},
				} );
			}
			renderedLayout = ReactDomServer.renderToString( element );
			markupCache.set( key, renderedLayout );
		}
		const rtsTimeMs = Date.now() - startTime;
		debug( 'Server render time (ms)', rtsTimeMs );

		logServerEvent( req.context.sectionName, [
			{
				name: `ssr.markup_cache.${ markupFromCache ? 'hit' : 'miss' }`,
				type: 'counting',
			},
			// Only log the render time if we didn't get it from the cache.
			...( markupFromCache
				? []
				: [
						{
							name: 'ssr.react_render.duration',
							type: 'timing',
							value: rtsTimeMs,
						},
				  ] ),
		] );

		if ( rtsTimeMs > 100 ) {
			// Server renders should probably never take longer than 100ms
			bumpStat( 'calypso-ssr', 'over-100ms-rendertostring' );
		}

		return renderedLayout;
	} catch ( ex ) {
		try {
			req.logger.error( ex );
		} catch ( err ) {
			// Failed to log the error, swallow it in prod so it doesn't break anything. This will serve
			// a blank page and the client will render on top of it.
			if ( process.env.NODE_ENV === 'development' ) {
				throw ex;
			}
		}
	}
	//todo: render an error?
}

const cachedLanguageManifest = {};
const getLanguageManifest = ( langSlug ) => {
	const key = `${ langSlug }`;

	if ( ! cachedLanguageManifest[ key ] ) {
		const languageManifestFilepath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'public',
			'languages',
			`${ langSlug }-language-manifest.json`
		);
		cachedLanguageManifest[ key ] = fs.existsSync( languageManifestFilepath )
			? JSON.parse( fs.readFileSync( languageManifestFilepath, 'utf8' ) )
			: null;
	}
	return cachedLanguageManifest[ key ];
};

export function attachI18n( context ) {
	let localeSlug = getCurrentLocaleVariant( context.store.getState() ) || context.lang;
	const shouldUseFallbackLocale =
		context.user?.use_fallback_for_incomplete_languages && isTranslatedIncompletely( localeSlug );

	if ( shouldUseFallbackLocale ) {
		localeSlug = config( 'i18n_default_locale_slug' );
	}

	if ( ! isDefaultLocale( localeSlug ) ) {
		context.i18nLocaleScript = getLanguageFileUrl( localeSlug, 'js', context.languageRevisions );
	}

	if ( ! isDefaultLocale( localeSlug ) && context.useTranslationChunks ) {
		context.entrypoint.language = {};

		const languageManifest = getLanguageManifest( localeSlug );

		if ( languageManifest ) {
			context.entrypoint.language.manifest = getLanguageManifestFileUrl( {
				localeSlug: localeSlug,
				fileType: 'js',
				hash: context?.languageRevisions?.hashes?.[ localeSlug ],
			} );

			context.entrypoint.language.translations = context.entrypoint.js
				.concat( context.chunkFiles.js )
				.map( ( chunk ) => path.parse( chunk ).name )
				.filter( ( chunkId ) => languageManifest.translatedChunks.includes( chunkId ) )
				.map( ( chunkId ) =>
					getTranslationChunkFileUrl( {
						chunkId,
						localeSlug: localeSlug,
						fileType: 'js',
						hash: context?.languageRevisions?.[ localeSlug ],
					} )
				);
		}
	}

	if ( context.store ) {
		context.lang = getCurrentLocaleSlug( context.store.getState() ) || localeSlug;
	}
}

export function attachHead( context ) {
	const title = getDocumentHeadFormattedTitle( context.store.getState() );
	const metas = getDocumentHeadMeta( context.store.getState() );
	const links = getDocumentHeadLink( context.store.getState() );
	context.head = {
		title,
		metas,
		links,
	};
}

export function attachBuildTimestamp( context ) {
	try {
		context.buildTimestamp = BUILD_TIMESTAMP;
	} catch ( e ) {
		context.buildTimestamp = null;
		debug( 'BUILD_TIMESTAMP is not defined for wp-desktop builds and is expected to fail here.' );
	}
}

export function serverRender( req, res ) {
	performanceMark( req.context, 'serverRender' );
	const context = req.context;

	let cacheKey = false;

	attachI18n( context );

	if ( shouldServerSideRender( context ) ) {
		performanceMark( req.context, 'render layout', true );
		cacheKey = getCacheKey( req );
		debug( `SSR render with cache key ${ cacheKey }.` );

		context.renderedLayout = render( context.layout, req.error?.message ?? cacheKey, req );
	}

	performanceMark( req.context, 'dehydrateQueryClient', true );
	context.initialQueryState = dehydrateQueryClient( context.queryClient );

	if ( context.store ) {
		performanceMark( req.context, 'redux store', true );
		attachHead( context );

		const isomorphicSubtrees = context.section?.isomorphic ? [ 'themes', 'ui', 'plugins' ] : [];
		const initialClientStateTrees = [ 'documentHead', ...isomorphicSubtrees ];

		// Send state to client
		context.initialReduxState = pick( context.store.getState(), initialClientStateTrees );

		/**
		 * Cache redux state to speedup future renders. For example, some network
		 * requests are skipped if the data is already in the store. Note that
		 * cacheKey is only defined when SSR is enabled, which means the cache
		 * is only set in logged-out contexts.
		 *
		 * Also note that we should only cache data which maps 1:1 to a route.
		 * For example, the themes data on the logged-out "/themes" route is always
		 * the same. And since the locale is encoded into the logged-out route
		 * (like /es/themes), that applies to every user.
		 */
		if ( cacheKey ) {
			const { documentHead, themes, plugins } = context.store.getState();
			const serverState = serialize( context.store.getCurrentReducer(), {
				documentHead,
				themes,
				plugins,
			} );
			stateCache.set( cacheKey, serverState.get() );
		}
	}
	performanceMark( req.context, 'final render', true );
	context.clientData = config.clientData;

	attachBuildTimestamp( context );

	res.send( renderJsx( 'index', context ) );
	performanceMark( req.context, 'post-sending JSX' );
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
 * @param {Object}   context  The entire request context
 * @param {Function} next     As all middlewares, will call next in the sequence
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
 * @param {Object}   context The currently built context
 * @returns {boolean} True if all the app-level criteria are fulfilled.
 */
function isServerSideRenderCompatible( context ) {
	return Boolean(
		context.section?.isomorphic &&
			! context.user && // logged out only
			( context.layout || context.cachedMarkup ) // A layout was generated or we have one cached.
	);
}

/**
 * The main entry point for server-side rendering checks, and the final authority if a page should be SSRed.
 *
 * Warning: the context needs to be 'ready' for these checks (needs to have all values)
 *
 * @param {Object}   context The currently built context
 * @returns {boolean} if the current page/request should return a SSR response
 */
export function shouldServerSideRender( context ) {
	return Boolean(
		config.isEnabled( 'server-side-rendering' ) &&
			isServerSideRenderCompatible( context ) &&
			context.serverSideRender === true
	);
}
