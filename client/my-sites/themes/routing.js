/**
 * External dependencies
 */
import transform from 'lodash/object/transform';

/**
 * Internal dependencies
 */
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
