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
import { Header } from 'gutenboarding/components/header';
import Sidebar from './components/sidebar';
import SettingsSidebar from './components/settings-sidebar';
import SettingsButton from './components/settings-button';

import '@wordpress/edit-post/build-style/style.css';
import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/format-library/build-style/style.css';

export function Gutenboard() {
	const [ blocks, updateBlocks ] = useState( [] );
	const [ isSettingsSidebarActive, updateIsSettingsSidebarActive ] = useState( true );

	function handleToggleSettingsSidebar() {
		updateIsSettingsSidebarActive( ! isSettingsSidebarActive );
	}

	return (
		<div className="gutenboarding">
			<Header />
			<SlotFillProvider>
				<DropZoneProvider>
					<BlockEditorProvider value={ blocks } onInput={ updateBlocks } onChange={ updateBlocks }>
						<div className="gutenboarding__block-editor">
							<BlockEditorKeyboardShortcuts />
							<SettingsButton
								onClick={ handleToggleSettingsSidebar }
								isToggled={ isSettingsSidebarActive }
							/>

							<SettingsSidebar isActive={ isSettingsSidebarActive } />
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
