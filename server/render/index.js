/**
 * External dependencies
 */
import ReactDomServer from 'react-dom/server';
import Helmet from 'react-helmet';
import memoize from 'lodash/function/memoize';
import superagent from 'superagent';
import Lru from 'lru-cache';

/**
 * Internal dependencies
 */
import config from 'config';

const markupCache = new Lru( { max: 1000 } );
const memoizedRenderToString = memoize( ReactDomServer.renderToString, element => JSON.stringify( element ) );

function bumpStat( group, name ) {
	const url = `http://pixel.wp.com/g.gif?v=wpcom-no-pv&x_${ group }=${ name }&t=${ Math.random() }`;

	if ( config( 'env' ) === 'production' ) {
		superagent.get( url ).end();
	}
}

export function render( element ) {
	memoizedRenderToString.cache = markupCache;

	if ( ! memoizedRenderToString.cache.has( JSON.stringify( element ) ) ) {
		bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
	}

	try {
		const startTime = Date.now();
		const context = {
			layout: memoizedRenderToString( element, JSON.stringify( element ) ),
		};
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
}
