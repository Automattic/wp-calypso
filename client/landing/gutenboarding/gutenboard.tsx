/**
 * External dependencies
 */
import '@wordpress/editor'; // This shouldn't be necessary
import { __ } from '@wordpress/i18n';
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

/**
 * Internal dependencies
 */
import Header from './components/header';
import { name, settings } from './onboarding-block';
import { Slot as SidebarSlot } from './components/sidebar';
import SettingsSidebar from './components/settings-sidebar';
import './stores/domain-suggestions';
import './stores/onboard';
import './stores/verticals-templates';
import './style.scss';

import { PageTemplateModal } from '../../../apps/full-site-editing/full-site-editing-plugin/starter-page-templates/page-template-modal';

// Copied from https://github.com/WordPress/gutenberg/blob/c7d00c64a4c74236a4aab528b3987811ab928deb/packages/edit-post/src/keyboard-shortcuts.js#L11-L15
// to be consistent with Gutenberg's shortcuts, and in order to avoid pulling in all of `@wordpress/edit-post`.
const toggleSidebarShortcut = {
	raw: rawShortcut.primaryShift( ',' ),
	display: displayShortcut.primaryShift( ',' ),
	ariaLabel: shortcutAriaLabel.primaryShift( ',' ),
};

registerBlockType( name, settings );

const onboardingBlock = createBlock( name, {} );

const DesignSelector = () => {
	const siteVertical = useSelect(
		select => select( 'automattic/onboard' ).getState().siteVertical
	);
	const templates = useSelect( select =>
		select( 'automattic/verticals/templates' ).getTemplates( siteVertical.id )
	);
	return (
		<PageTemplateModal
			segment="m1" // FIXME: Replace with actual segment!
			templates={ templates }
			vertical={ siteVertical }
		/>
	);
};

// Makeshift block so we can drop the modal into the block editor. Might want to change that later.
registerBlockType( 'automattic/page-templates', {
	title: 'Page Templates',
	icon: 'universal-access-alt',
	category: 'layout',
	attributes: {},
	edit() {
		return <DesignSelector />;
	},
} );

const templateBlock = createBlock( 'automattic/page-templates', {} );

export function Gutenboard() {
	const [ isEditorSidebarOpened, updateIsEditorSidebarOpened ] = useState( false );
	const toggleGeneralSidebar = () => updateIsEditorSidebarOpened( isOpen => ! isOpen );

	// FIXME: Quick'n'dirty step state, replace with router
	const [ currentStep, setStep ] = useState( 0 );
	const goToNextStep = () => setStep( step => step + 1 );

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
							next={ goToNextStep }
							toggleGeneralSidebar={ toggleGeneralSidebar }
							toggleSidebarShortcut={ toggleSidebarShortcut }
						/>
						<BlockEditorProvider
							value={ [ currentStep === 0 ? onboardingBlock : templateBlock ] }
							settings={ { templateLock: 'all' } }
						>
							<div className="edit-post-layout__content">
								<div
									className="edit-post-visual-editor editor-styles-wrapper"
									role="region"
									aria-label={ __( 'Onboarding screen content' ) }
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
