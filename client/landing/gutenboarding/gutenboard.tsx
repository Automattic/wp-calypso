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
import { useSelect, useDispatch } from '@wordpress/data';
import '@wordpress/format-library';
import classnames from 'classnames';
import React, { useRef, useState, useEffect } from 'react';
import '@wordpress/components/build-style/style.css';

/**
 * Internal dependencies
 */
import Header from './components/header';
import { name, settings } from './onboarding-block';
import { Slot as SidebarSlot } from './components/sidebar';
import SettingsSidebar from './components/settings-sidebar';
import { State as OnboardingState } from './stores/onboard/reducer';
import { STORE_KEY } from './stores/onboard';
import { Steps } from './types';
import '@automattic/calypso-data-stores/src/domain-suggestions';
import '@automattic/calypso-data-stores/src/verticals-templates';
import './style.scss';

const stepCompleted: Record< Steps, ( state: OnboardingState ) => boolean > = {
	[ Steps.IntentGathering ]: ( { siteVertical } ) => !! siteVertical,
	[ Steps.DesignSelection ]: () => false, // ( { design } ) => !! design, // TODO: Enable once we have `design` in onboarding state
};

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

	const onboardingState = useSelect( select => select( STORE_KEY ).getState() );

	// FIXME: Quick'n'dirty step state, replace with router
	const [ currentStep, setStep ] = useState( Steps.IntentGathering );
	const goToNextStep = stepCompleted[ currentStep ]( onboardingState )
		? () => setStep( step => step + 1 )
		: undefined;
	const goToPrevStep = currentStep > 0 ? () => setStep( step => step - 1 ) : undefined;

	const onboardingBlock = useRef( createBlock( name, { step: currentStep } ) );

	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );
	useEffect(
		() =>
			void updateBlockAttributes( onboardingBlock.current.clientId, {
				step: currentStep,
			} ),
		[ currentStep, updateBlockAttributes ]
	);

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
							prev={ goToPrevStep }
							toggleGeneralSidebar={ toggleGeneralSidebar }
							toggleSidebarShortcut={ toggleSidebarShortcut }
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
