/**
 * External dependencies
 */
import { reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { domForHtml } from './utils';

export default function createDomTransformRunner( transforms ) {
	return function withContentDOM( post ) {
		if ( ! post || ! post.content || ! transforms ) {
			return post;
		}

		const dom = domForHtml( post.content );

		post = reduce( transforms, ( memo, transform ) => {
			return transform( memo, dom );
		}, post );

		post.content = dom.innerHTML;
		dom.innerHTML = '';

		return post;
	};
}
