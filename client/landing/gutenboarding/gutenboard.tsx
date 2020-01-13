/**
 * External dependencies
 */
import '@wordpress/editor'; // This shouldn't be necessary
import { __ as NO__ } from '@wordpress/i18n';
import {
	BlockEditorProvider,
	BlockList,
	WritingFlow,
	ObserveTyping,
} from '@wordpress/block-editor';
import {
	Popover,
	SlotFillProvider,
	DropZoneProvider,
	KeyboardShortcuts,
} from '@wordpress/components';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { rawShortcut, displayShortcut, shortcutAriaLabel } from '@wordpress/keycodes';
import { useSelect } from '@wordpress/data';
import '@wordpress/format-library';
import classnames from 'classnames';
import React, { useRef, useState } from 'react';
import '@wordpress/components/build-style/style.css';
import { useRouteMatch } from 'react-router-dom';

/**
 * Internal dependencies
 */
import Header from './components/header';
import { name, settings } from './onboarding-block';
import { Slot as SidebarSlot } from './components/sidebar';
import SettingsSidebar from './components/settings-sidebar';
import { STORE_KEY } from './stores/onboard';
import { User } from '@automattic/data-stores';
import { routes, Step } from './steps';
import './style.scss';

// Copied from https://github.com/WordPress/gutenberg/blob/c7d00c64a4c74236a4aab528b3987811ab928deb/packages/edit-post/src/keyboard-shortcuts.js#L11-L15
// to be consistent with Gutenberg's shortcuts, and in order to avoid pulling in all of `@wordpress/edit-post`.
const toggleSidebarShortcut = {
	raw: rawShortcut.primaryShift( ',' ),
	display: displayShortcut.primaryShift( ',' ),
	ariaLabel: shortcutAriaLabel.primaryShift( ',' ),
};

registerBlockType( name, settings );

const USER_STORE = User.register();

export function Gutenboard() {
	const [ isEditorSidebarOpened, updateIsEditorSidebarOpened ] = useState( false );
	const toggleGeneralSidebar = () => updateIsEditorSidebarOpened( isOpen => ! isOpen );

	const { siteVertical } = useSelect( select => select( STORE_KEY ).getState() );
	const isLoggedIn = useSelect( select => select( USER_STORE ).getUser()?.ID );

	// @TODO: This is currently needed in addition to the routing (inside the Onboarding Block)
	// for the 'Back' and 'Next' buttons in the header. If we remove those (and move navigation
	// entirely into the block), we'll be able to remove this code.
	const r = useRouteMatch( routes );
	let next: undefined | string;
	let prev: undefined | string;
	switch ( r?.url ) {
		case Step.IntentGathering:
			if ( siteVertical ) {
				next = Step.DesignSelection;
			}
			break;

		case Step.DesignSelection:
			prev = Step.IntentGathering;
			break;
	}

	// We're persisting the block via `useRef` in order to prevent re-renders
	// which would collide with the routing done inside of the block
	// (and would lead to weird mounting/unmounting behavior).
	const onboardingBlock = useRef( createBlock( name, {} ) );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="block-editor__container">
			<SlotFillProvider>
				<DropZoneProvider>
					<div
						className={ classnames( 'edit-post-layout', {
							'is-sidebar-opened': isEditorSidebarOpened,
						} ) }
					>
						<KeyboardShortcuts
							bindGlobal
							shortcuts={ {
								[ toggleSidebarShortcut.raw ]: toggleGeneralSidebar,
							} }
						/>
						<Header
							isEditorSidebarOpened={ isEditorSidebarOpened }
							toggleGeneralSidebar={ toggleGeneralSidebar }
							toggleSidebarShortcut={ toggleSidebarShortcut }
							prev={ prev }
							next={ next }
							isLoggedIn={ isLoggedIn }
						/>
						<BlockEditorProvider
							useSubRegistry={ false }
							value={ [ onboardingBlock.current ] }
							settings={ { templateLock: 'all' } }
						>
							<div className="gutenboard__edit-post-layout-content edit-post-layout__content ">
								<div
									className="edit-post-visual-editor editor-styles-wrapper"
									role="region"
									aria-label={ NO__( 'Onboarding screen content' ) }
									tabIndex={ -1 }
								>
									<WritingFlow>
										<ObserveTyping>
											<BlockList className="gutenboarding-block-list" />
										</ObserveTyping>
									</WritingFlow>
								</div>
							</div>
							<div>
								<SettingsSidebar isActive={ isEditorSidebarOpened } />
								<SidebarSlot />
							</div>
						</BlockEditorProvider>
					</div>
				</DropZoneProvider>
			</SlotFillProvider>
			<Popover.Slot />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
