import reduce from 'lodash/reduce';

export default function createDomTransformRunner( transforms ) {
	return function withContentDOM( post ) {
		if ( ! post || ! post.content || ! transforms ) {
			return post;
		}

		// spin up the DOM
		const dom = document.createElement( 'div' );
		dom.innerHTML = post.content;
		post = reduce( transforms, ( memo, transform ) => {
			return transform( memo, dom );
		}, post );
		post.content = dom.innerHTML;
		dom.innerHTML = '';
		return post;
	};
}
