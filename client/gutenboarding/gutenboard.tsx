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
import { createBlock, registerBlockType } from '@wordpress/blocks';
import '@wordpress/format-library';
import '@wordpress/edit-post/build-style/style.css';
import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/format-library/build-style/style.css';

/**
 * Internal dependencies
 */
import { Header } from 'gutenboarding/components/header';
import { name, settings } from './onboarding-block';
import Sidebar from './components/sidebar';
import SettingsSidebar from './components/settings-sidebar';
import './store';
import './style.scss';

registerBlockType( name, settings );

const onboardingBlock = createBlock( name, {} );

export function Gutenboard() {
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
					<BlockEditorProvider value={ [ onboardingBlock ] } settings={ { templateLock: 'all' } }>
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
