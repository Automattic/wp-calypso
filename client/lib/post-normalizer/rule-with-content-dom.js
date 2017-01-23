/**
 * External Dependencies
 */
import { defer, map } from 'lodash';

/**
 * Internal Dependencies
 */
import { domForHtml } from './utils';

const promisifyAndDeferTransformWithDom = ( transform, dom ) => ( post ) =>
	new Promise( ( resolve ) => defer( () => resolve( transform( post, dom ) ) ) );

export const serialReduce = ( transforms, startingValue ) =>
	transforms.reduce(
		( promise, fn ) => promise.then( result => fn( result ) ),
		Promise.resolve( startingValue
		)
	);

/**
 * Returns a promise with the eventual normalized post object
 * @param transforms
 */
export const asyncWithContentDom = transforms => post => {
	if ( ! post || ! post.content || ! transforms ) {
		return post;
	}

	const dom = domForHtml( post.content );
	const postPromise = serialReduce( map( transforms, transform => promisifyAndDeferTransformWithDom( transform, dom ) ), post );

	return postPromise.then( p => {
		p.content = dom.innerHTML;
		dom.innerHTML = '';

		return p;
	} );
}

