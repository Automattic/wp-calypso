/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';

/**
 * WordPress dependencies
 */
import {
	BlockEditorProvider,
	BlockList,
	ObserveTyping,
	WritingFlow,
} from '@wordpress/block-editor';
import { registerCoreBlocks } from '@wordpress/block-library';
import { BlockInstance, parse, serialize } from '@wordpress/blocks';

import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';

registerCoreBlocks();

export const BlockPlayground: FunctionComponent = () => {
	useEffect( () => {
		import(
			/* webpackChunkName: "dev-docs-block-playground" */ '../../../apps/o2-blocks/src/editor.js'
		);
	}, [] );

	const [ blocks, setBlocks ] = useState< BlockInstance[] >( [] );
	const [ post, setPost ] = useState< string >( '' );
	const update = ( newBlocks: BlockInstance[] ) => {
		setBlocks( newBlocks );
		setPost( serialize( newBlocks ) );
	};

	return (
		<Main className="devdocs block-playground">
			<DocumentHead title="Block Playground" />
			<div>
				<BlockEditorProvider value={ blocks } onInput={ update } onChange={ update }>
					<WritingFlow>
						<ObserveTyping>
							<BlockList />
						</ObserveTyping>
					</WritingFlow>
				</BlockEditorProvider>
			</div>
			<textarea
				style={ { minHeight: '480px' } }
				value={ post }
				onChange={ ( event ) => setPost( event.target.value ) }
				onBlur={ () => setBlocks( parse( post ) ) }
			/>
		</Main>
	);
};

export default BlockPlayground;
