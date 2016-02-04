/**
 * External dependencies
 */
import transform from 'lodash/object/transform';

/**
 * Internal dependencies
 */
//import render from 'server/render';
import controller from 'my-sites/controller';
import { layoutFactory } from './controller';

const routing = {
	routes: [
		{ value: '/design/:site_id' },
		{ value: '/design/type/:tier/:site_id' },
		{ value: '/design/type/:tier', allowLoggedOut: true },
		{ value: '/design', allowLoggedOut: true },
	],
	middlewares: [
		{ value: controller.navigation },
		{ value: controller.siteSelection },
	]
};

export function getRouting( isLoggedIn ) {
	const testKey = isLoggedIn ? 'value' : 'allowLoggedOut';
	return transform( routing, ( acc, collection, collectionName ) => {
		acc[ collectionName ] = collection
			.filter( item => item[ testKey ] )
			.map( item => item.value );
	} );
}

export function selectFactory( context ) {
	console.log( 'A' );
	if ( context.app ) {
		console.log( 'B' );
		return require( 'layout/logged-out-design' );
	}

	console.log( 'C' );
	return layoutFactory;
}

export function selectProps( context ) {
	const { path, store } = context;
	const { tier, site_id } = context.params;

	console.log( 'tier', tier, 'site_id', site_id );

	return {
		path,
		tier,
		site_id,
		store,
		title: 'Themez',
		queryString: context.query.s,
	};
}

//export function serverRouteHandler( context, req, res ) {
//	context = render.getExtendedContext( context, req );
//	const factory = selectFactory( context );
//	const props = selectProps( context );
//	const renderer = render.makeRenderer( factory );
//
//	render.runServerRender( renderer( props ), context );
//	res.render( 'index.jade', context );
//}

//function getParams( path, patterns ) {
//	let results;
//	patterns.some( pattern => {
//		const matches = path.match( pattern );
//		if ( matches && matches.length ) {
//			results = matches[1];
//			return true;
//		}
//	} );
//	return results;
//}
	//let tier = getParams( path, [
	//		/\/design\/type\/([^/]+)\//,
	//		/\/design\/type\/([^/]+)/,
	//] );

	//tier = includes( [ 'all', 'free', 'premium' ], tier )
	//	? tier
	//	: 'all';

	//const site_id = getParams( path, [
	//		/\/design\/type\/[^/]+\/([^/]+)/,
	//		/\/design\/([^/]+)\/?$/,
	//] );

