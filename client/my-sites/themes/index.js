/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';
import { getRouting, selectFactory, selectProps } from './routing';

const user = userFactory();

export default function() {
	if ( config.isEnabled( 'manage/themes' ) ) {
		const { routes, middlewares } = getRouting( !! user.get() );
		const handlers = [ ...middlewares, ( context ) => {
			const factory = selectFactory( context );
			const props = selectProps( context );
			render( factory( props ) );
		} ];

		routes.forEach( route => page( route, ...handlers ) );
	}
}

function render( ui ) {
	ReactDom.render( ui, document.getElementById( 'primary' ) );
}

	//const testKeys = validKeys( criteria );
	//const matchesKeys = ( item ) => testKeys.every( key => !! item[ key ] );
///*
// * Converts { foo: true, bar: undefined, baz: 42 }
// * to [ 'foo', 'baz' ]
// */
//function validKeys( obj ) {
//	return Object.keys( obj ).reduce( ( acc, key ) =>
//			obj[ key ] !== undefined ? [ ...acc, key ] : acc,
//			[] );
//}

//const fooRouting = {
//	routes: [
//		{
//			value: '/design/:site_id',
//			requireUser: true,
//			clientSide: true,
//		},
//		{
//			value: '/design/type/:tier/:site_id',
//			requireUser: true,
//			clientSide: true,
//		},
//		{
//			value: '/design/type/:tier',
//			requireUser: true,
//			loggedOut: true,
//			clientSide: true,
//			serverSide: true,
//		},
//		{
//			value: '/design',
//			requireUser: true,
//			loggedOut: true,
//			clientSide: true,
//			serverSide: true,
//		},
//	],
//	middlewares: [
//		{
//			value: controller.navigation,
//			requireUser: true,
//			clientSide: true,
//		},
//		{
//			value: controller.siteSelection,
//			requireUser: true,
//			clientSide: true,
//		},
//		{
//			value: themesController.themes,
//			requireUser: true,
//			loggedOut: true,
//			clientSide: true,
//		},
//		/*
//		 * later, themesController will do both client and server
//		 */
//		//{
//		//	value: basicThemesController,
//		//	loggedOut: true,
//		//	clientSide: true,
//		//	serverSide: true,
//		//},
//	]
//};
//
//function makeClientRoutes() {
//	if ( config.isEnabled( 'manage/themes' ) ) {
//		const { routes, middlewares } = getRouting( {
//			requireUser: user.get() ? true : undefined,
//			clientSide: true,
//		} );
//		routes.forEach( route => page( route, ...middlewares ) );
//	}
//}
//
////export function makeServerRoutes(
////		app,
////		getDefaultContext,
////		renderLoggedInRoute
////	) {
////	if ( config.isEnabled( 'manage/themes' ) ) {
////		const { routes, middlewares } = getRouting( {
////			serverSide: true,
////		} );
////		routes.forEach( route => page( route, ...middlewares ) );
////	}
////
////	function makeServerRoute( path, selector, controller ) {
////		app.get( path, ( req, res ) => {
////			const context = getExtendedContext( req );
////
////			if ( req.cookies.wordpress_logged_in ||
////					! config.isEnabled( 'manage/themes/logged-out' ) ) {
////				renderLoggedInRoute( req, res );
////				return;
////			}
////
////			const args = selector( req, context );
////			Object.assign( context, memo( controller, ...args ) );
////			res.render( 'index.jade', context );
////		} );
////	}
////
////	function getExtendedContext( req ) {
////		const { params = {} } = req;
////		const isLoggedIn = req.cookies.wordpress_logged_in;
////		return Object.assign( getDefaultContext( req ), {
////			params, isLoggedIn
////		} );
////	}
////}
//
//function getRouting( criteria = {} ) {
//	return transform( routing, ( acc, collection, collectionName ) => {
//		acc[ collectionName ] = select( collection, criteria );
//	} );
//}
//
///*
// * [ { value: 'foo', crit: true }, { value: 'bar', crit: false } ]
// * ->
// * [ 'foo' ]
// */
//function select( collection, criteria ) {
//	return map(
//			filter( collection, prunedCriteria( criteria ) ),
//			x => x.value );
//}
//
//function prunedCriteria( criteria ) {
//	return transform( criteria, ( acc, val, key ) => {
//		if ( typeof val !== 'undefined' ) {
//			acc[ key ] = val;
//		}
//	} );
//}
