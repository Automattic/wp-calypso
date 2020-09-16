/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getBlockByType } from './blocks';

const FormattedBlock = ( { content = {}, onClick = null, meta = {} } ) => {
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

	const blockToRender = getBlockByType( type );
	if ( blockToRender ) {
		return blockToRender( { content, onClick, meta, children } );
	}

	return <>{ children }</>;
};

export default FormattedBlock;
