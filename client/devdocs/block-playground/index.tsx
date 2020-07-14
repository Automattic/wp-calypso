/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';

/**
 * WordPress dependencies
 */
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';

export const BlockPlayground: FunctionComponent = () => {
	const [ blocks, setBlocks ] = useState< object[] >( [] );

	return (
		<Main className="devdocs block-playground">
			<DocumentHead title="Block Playground" />
			<div>
				<BlockEditorProvider value={ blocks } onInput={ setBlocks } onChange={ setBlocks }>
					<BlockList />
				</BlockEditorProvider>
			</div>
		</Main>
	);
};

export default BlockPlayground;
