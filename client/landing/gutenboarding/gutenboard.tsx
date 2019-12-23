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
import React, { useState } from 'react';
import '@wordpress/components/build-style/style.css';
import { Redirect, useRouteMatch } from 'react-router-dom';

/**
 * Internal dependencies
 */
import Header from './components/header';
import { name, settings } from './onboarding-block';
import { Slot as SidebarSlot } from './components/sidebar';
import SettingsSidebar from './components/settings-sidebar';
import { STORE_KEY } from './stores/onboard';
import './style.scss';

// Copied from https://github.com/WordPress/gutenberg/blob/c7d00c64a4c74236a4aab528b3987811ab928deb/packages/edit-post/src/keyboard-shortcuts.js#L11-L15
// to be consistent with Gutenberg's shortcuts, and in order to avoid pulling in all of `@wordpress/edit-post`.
const toggleSidebarShortcut = {
	raw: rawShortcut.primaryShift( ',' ),
	display: displayShortcut.primaryShift( ',' ),
	ariaLabel: shortcutAriaLabel.primaryShift( ',' ),
};

registerBlockType( name, settings );

export function Gutenboard() {
	const [ isEditorSidebarOpened, updateIsEditorSidebarOpened ] = useState( false );
	const toggleGeneralSidebar = () => updateIsEditorSidebarOpened( isOpen => ! isOpen );

	const { siteTitle, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );
	const r = useRouteMatch( '*' );

	let redirect: undefined | string;
	let next: undefined | string;
	let prev: undefined | string;
	switch ( r?.url ) {
		case '/':
			if ( siteTitle ) {
				next = '/design';
			}
			break;

		case '/design':
			if ( ! siteVertical ) {
				redirect = '/';
			}
			prev = '/';
			break;

		default:
			redirect = '/';
			break;
	}

	const onboardingBlock = createBlock( name, {} );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="block-editor__container">
			{ redirect && <Redirect to={ redirect } /> }
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
						/>
						<BlockEditorProvider
							useSubRegistry={ false }
							value={ [ onboardingBlock ] }
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
