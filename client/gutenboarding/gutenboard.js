/**
 * WordPress dependencies
 */
import '@wordpress/editor'; // This shouldn't be necessary

import React, { useState } from 'react';
import {
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
	BlockList,
	WritingFlow,
	ObserveTyping,
} from '@wordpress/block-editor';
import { Popover, SlotFillProvider, DropZoneProvider } from '@wordpress/components';
import { registerCoreBlocks } from '@wordpress/block-library';
import '@wordpress/format-library';

/**
 * Internal dependencies
 */
import './style.scss';

/* eslint-disable no-restricted-syntax */
import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/format-library/build-style/style.css';
/* eslint-enable no-restricted-syntax */

export class Gutenboard extends React.Component {
	state = { blocks: [] };

	componentDidCatch( err ) {
		console.error( err );
		debugger;
	}

	updateBlocks = blocks => this.setState( { blocks } );

	render() {
		return (
			<>
				<div className="playground__header">
					<h1 className="playground__logo">Gutenberg Playground</h1>
				</div>
				<div className="playground__body">
					<SlotFillProvider>
						<DropZoneProvider>
							<BlockEditorProvider
								value={ this.state.blocks }
								onInput={ this.updateBlocks }
								onChange={ this.updateBlocks }
							>
								<div className="editor-styles-wrapper">
									<BlockEditorKeyboardShortcuts />
									<WritingFlow>
										<ObserveTyping>
											<BlockList />
										</ObserveTyping>
									</WritingFlow>
								</div>
								<Popover.Slot />
							</BlockEditorProvider>
						</DropZoneProvider>
					</SlotFillProvider>
				</div>
			</>
		);
	}
}

registerCoreBlocks();
