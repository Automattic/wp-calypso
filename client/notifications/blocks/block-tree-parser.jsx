import React from 'react';
import {
	flip,
	head,
	propOr
} from 'ramda';

import CommentBlock from './comment-block';
import LinkBlock from './link-block';
import PostBlock from './post-block';
import SiteBlock from './site-block';
import TypedBlock from './typed-block';
import UserBlock from './user-block';

const HtmlBlock = Element => ( { children } ) =>
	<Element>{ children }</Element>;

const blockMapping = flip( propOr( TypedBlock ) )( {
	b: HtmlBlock( 'b' ),
	blockquote: HtmlBlock( 'blockquote' ),
	code: HtmlBlock( 'code' ),
	comment: CommentBlock,
	em: HtmlBlock( 'em' ),
	i: HtmlBlock( 'i' ),
	link: LinkBlock,
	post: PostBlock,
	site: SiteBlock,
	strong: HtmlBlock( 'strong' ),
	user: UserBlock
} );

export const addKey = ( element, key ) =>
	React.cloneElement( element, { key } );

const reduceTree = ( elements, node ) => {
	if ( 'string' === typeof node ) {
		return [
			...elements,
			<span>{ node }</span>
		];
	}

	const Element = blockMapping( node.type );

	if ( ! node.children ) {
		return [
			...elements,
			<Element { ...node } />
		];
	}

	const firstChild = head( node.children );
	if ( 1 === node.children.length && 'string' === typeof firstChild ) {
		return [
			...elements,
			<Element { ...node }>{ firstChild }</Element>
		];
	}

	const children = node
		.children
		.reduce( reduceTree, [] );

	return [
		...elements,
		<Element { ...node }>{ children.map( addKey ) }</Element>
	];
};

export const parseBlockTree = tree => {
	return (
		<span>
			{ tree.reduce( reduceTree, [] ).map( addKey ) }
		</span>
	);
};

export default parseBlockTree;
