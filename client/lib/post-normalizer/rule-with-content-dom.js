import reduce from 'lodash/reduce';

export default function createDomTransformRunner( transforms ) {
	return function withContentDOM( post ) {
		if ( ! post || ! post.content || ! transforms ) {
			return post;
		}

		let dom;
		if ( typeof DOMParser !== 'undefined' && DOMParser.prototype.parseFromString ) {
			const parser = new DOMParser();
			dom = parser.parseFromString( post.content, 'text/html' );
		} else {
			dom = document.createElement( 'div' );
			dom.innerHTML = post.content;
		}

		post = reduce( transforms, ( memo, transform ) => {
			return transform( memo, dom );
		}, post );
		post.content = dom.innerHTML;
		dom.innerHTML = '';
		return post;
	};
}
