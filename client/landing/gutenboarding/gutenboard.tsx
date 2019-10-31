/**
 * External dependencies
 */
import '@wordpress/editor'; // This shouldn't be necessary
import { __ } from '@wordpress/i18n';
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
import classnames from 'classnames';
import React, { useState } from 'react';
import '@wordpress/components/build-style/style.css';

/**
 * Internal dependencies
 */
import Header from './components/header';
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

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="gutenboarding block-editor__container">
			<SlotFillProvider>
				<DropZoneProvider>
					<div
						className={ classnames( 'edit-post-layout', {
							'is-sidebar-opened': isEditorSidebarOpened,
						} ) }
					>
						<Header
							isEditorSidebarOpened={ isEditorSidebarOpened }
							toggleGeneralSidebar={ toggleGeneralSidebar }
						/>
						<BlockEditorProvider value={ [ onboardingBlock ] } settings={ { templateLock: 'all' } }>
							<div className="edit-post-layout__content">
								<BlockEditorKeyboardShortcuts />
								<div
									className="edit-post-visual-editor editor-styles-wrapper"
									role="region"
									aria-label={ __( 'Onboarding screen content' ) }
									tabIndex="-1"
								>
									<WritingFlow>
										<ObserveTyping>
											<BlockList />
										</ObserveTyping>
									</WritingFlow>
								</div>
								<Popover.Slot />
							</div>
							<div>
								<SettingsSidebar isActive={ isEditorSidebarOpened } />
								<Sidebar.Slot />
							</div>
						</BlockEditorProvider>
					</div>
				</DropZoneProvider>
			</SlotFillProvider>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
