/**
 * External dependencies
 */
import ReactDomServer from 'react-dom/server';
import Helmet from 'react-helmet';
import superagent from 'superagent';
import Lru from 'lru-cache';

/**
 * Internal dependencies
 */
import config from 'config';

const markupCache = new Lru( { max: 1000 } );

function bumpStat( group, name ) {
	const url = `http://pixel.wp.com/g.gif?v=wpcom-no-pv&x_${ group }=${ name }&t=${ Math.random() }`;

	if ( config( 'env' ) === 'production' ) {
		superagent.get( url ).end();
	}
}

/**
* Render and cache supplied React element to a markup string.
* Cache is keyed by stringified element by default.
*
* @param {object} element - React element to be rendered to html
* @param {string} key - (optional) custom key
* @return {object} context object with `layout` field populated
*/
export function render( element, key = JSON.stringify( element ) ) {
	try {
		const startTime = Date.now();

		let layout = markupCache.get( key );
		if ( ! layout ) {
			bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
			layout = ReactDomServer.renderToString( element );
			markupCache.set( key, layout );
		}
		const context = { layout };
		const rtsTimeMs = Date.now() - startTime;

		if ( Helmet.peek() ) {
			const helmetData = Helmet.rewind();
			Object.assign( {}, context, {
				helmetTitle: helmetData.title,
				helmetMeta: helmetData.meta,
				helmetLink: helmetData.link,
			} );
		}

		if ( rtsTimeMs > 15 ) {
			// We think that renderToString should generally
			// never take more than 15ms. We're probably wrong.
			bumpStat( 'calypso-ssr', 'loggedout-design-over-15ms-rendertostring' );
		}

		return context;
	} catch ( ex ) {
		if ( config( 'env' ) === 'development' ) {
			throw ex;
		}
	}
	//todo: render an error?
}
