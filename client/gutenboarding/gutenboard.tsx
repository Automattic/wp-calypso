/**
 * External dependencies
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
import { registerBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';
import '@wordpress/format-library';
import '@wordpress/edit-post/build-style/style.css';
import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/format-library/build-style/style.css';

/**
 * Internal dependencies
 */
import { Header } from 'gutenboarding/components/header';
import { name, settings } from './onboarding-block';
import Sidebar from './components/sidebar';
import SettingsSidebar from './components/settings-sidebar';
import './style.scss';

export function Gutenboard() {
	const [ blocks, updateBlocks ] = useState( [] );
	const [ isEditorSidebarOpened, updateIsEditorSidebarOpened ] = useState( true );

	function toggleGeneralSidebar() {
		updateIsEditorSidebarOpened( ! isEditorSidebarOpened );
	}

	return (
		<div className="gutenboarding">
			<Header
				isEditorSidebarOpened={ isEditorSidebarOpened }
				toggleGeneralSidebar={ toggleGeneralSidebar }
			/>
			<SlotFillProvider>
				<DropZoneProvider>
					<BlockEditorProvider value={ blocks } onInput={ updateBlocks } onChange={ updateBlocks }>
						<div className="gutenboarding__block-editor">
							<BlockEditorKeyboardShortcuts />

							<SettingsSidebar isActive={ isEditorSidebarOpened } />
							<Sidebar.Slot />
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
	);
}

registerCoreBlocks();

registerBlockType( name, settings );
