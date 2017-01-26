/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CodeBlock from './code';
import GenericBlock from './generic';

export function renderBlock( block ) {
	if ( block.type === 'Text' ) {
		return <p>{ block.value }</p>;
	}

	if ( block.blockType === 'code' ) {
		return <CodeBlock { ...block } />;
	}

	if ( block.type === 'WP_Block' ) {
		return <GenericBlock { ...block } />;
	}

	return null;
}
