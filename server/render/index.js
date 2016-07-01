/**
 * External dependencies
 */
import ReactDomServer from 'react-dom/server';
import Helmet from 'react-helmet';
import superagent from 'superagent';
import Lru from 'lru-cache';
import pick from 'lodash/pick';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';

const debug = debugFactory( 'calypso:server-render' );
const markupCache = new Lru( { max: 3000 } );

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
* @return {object} context object with `renderedLayout` field populated
*/
export function render( element, key = JSON.stringify( element ) ) {
	try {
		const startTime = Date.now();
		debug( 'cache access for key', key );

		let context = markupCache.get( key );
		if ( ! context ) {
			bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
			debug( 'cache miss for key', key );
			const renderedLayout = ReactDomServer.renderToString( element );
			context = { renderedLayout };

			if ( Helmet.peek() ) {
				const helmetData = Helmet.rewind();
				Object.assign( context, {
					helmetTitle: helmetData.title,
					helmetMeta: helmetData.meta,
					helmetLink: helmetData.link,
				} );
			}
			markupCache.set( key, context );
		}
		const rtsTimeMs = Date.now() - startTime;
		debug( 'Server render time (ms)', rtsTimeMs );

		if ( rtsTimeMs > 15 ) {
			// legacy stat from when we only had very simple server-renders
			bumpStat( 'calypso-ssr', 'loggedout-design-over-15ms-rendertostring' );
		}
		if ( rtsTimeMs > 100 ) {
			// Server renders should probably never take longer than 100ms
			bumpStat( 'calypso-ssr', 'over-100ms-rendertostring' );
		}

		return context;
	} catch ( ex ) {
		if ( config( 'env' ) === 'development' ) {
			throw ex;
		}
	}
	//todo: render an error?
}

export function serverRender( req, res ) {
	const context = req.context;

	if ( context.lang !== config( 'i18n_default_locale_slug' ) ) {
		context.i18nLocaleScript = '//widgets.wp.com/languages/calypso/' + context.lang + '.js';
	}

	if ( config.isEnabled( 'server-side-rendering' ) &&
		context.store &&
		context.layout &&
		! context.user ) {
		context.initialReduxState = pick( context.store.getState(), 'ui', 'themes' );
		const key = context.renderCacheKey || JSON.stringify( context.layout );
		Object.assign( context, render( context.layout, key ) );
	}

	if ( config.isEnabled( 'desktop' ) ) {
		res.render( 'desktop.jade', context );
	} else {
		res.render( 'index.jade', context );
	}
}
