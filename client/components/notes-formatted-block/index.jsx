/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import * as Blocks from './blocks';

export const FormattedBlockRenderer = ( blockTypeMapping ) => ( {
	content = {},
	onClick = null,
	meta = {},
} ) => {
	if ( 'string' === typeof content ) {
		return content;
	}

	const { children: nestedContent, text = null, type } = content;

	if ( undefined === type && ! nestedContent ) {
		return text;
	}

	const children = nestedContent.map( ( child, key ) => (
		<FormattedBlock key={ key } content={ child } onClick={ onClick } meta={ meta } />
	) );

	const blockToRender = blockTypeMapping[ type ];
	if ( blockToRender ) {
		return blockToRender( { content, onClick, meta, children } );
	}

	return <>{ children }</>;
};

const FormattedBlock = FormattedBlockRenderer( {
	b: Blocks.Strong,
	i: Blocks.Emphasis,
	pre: Blocks.Preformatted,
	a: Blocks.Link,
	link: Blocks.Link,
	filepath: Blocks.FilePath,
	post: Blocks.Post,
	person: Blocks.Person,
	plugin: Blocks.Plugin,
	theme: Blocks.Theme,
} );

export default FormattedBlock;
