/**
 * External dependencies
 */
import ReactDomServer from 'react-dom/server';
import Helmet from 'react-helmet';

/**
 * Internal dependencies
 */
import config from 'config';
import makeMemo from '../memo';

const memo = makeMemo();

export function makeSimpleRenderer( factory ) {
	return function renderToContext( props ) {
		const result = {
			layout: ReactDomServer.renderToString( factory( props ) )
		};
		if ( Helmet.peek() ) {
			const helmetData = Helmet.rewind();
			Object.assign( result, {
				helmetTitle: helmetData.title,
				helmetMeta: helmetData.meta,
				helmetLink: helmetData.link,
			} );
		}
		return result;
	};
}

export function makeCachedRenderer( factory ) {
	return memo.bind( null, makeSimpleRenderer( factory ) );
}

export function runServerRender( ui, context ) {
	if ( config.isEnabled( 'server-side-rendering' ) ) {
		Object.assign( context, ui )
	}
}

export function getExtendedContext( context, req ) {
	return Object.assign( {}, context, {
		path: req.path,
		params: Object.assign( {}, context.params, req.params ),
		query: {}
	} );
}

export function makeServerHandler( {
		selectFactory,
		selectProps,
		getDefaultContext,
		shouldCache = false,
	} ) {
	const makeRenderer = shouldCache ? makeCachedRenderer : makeSimpleRenderer;
	return function handler( req, res ) {
		const context = getExtendedContext( getDefaultContext( req ), req );
		const factory = selectFactory( context );
		const props = selectProps( context );
		const renderer = makeRenderer( factory );

		runServerRender( renderer( props ), context );
		res.render( 'index.jade', context );
	};
}
