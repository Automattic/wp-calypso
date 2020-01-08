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
import { Popover, DropZoneProvider } from '@wordpress/components';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import '@wordpress/format-library';
import React, { useRef } from 'react';
// Uncomment and remove the redundant sass import from `./style.css` when a release after @wordpress/components@8.5.0 is published.
// See https://github.com/WordPress/gutenberg/pull/19535
// import '@wordpress/components/build-style/style.css';
import { useRouteMatch } from 'react-router-dom';

/**
 * Internal dependencies
 */
import Header from './components/header';
import { name, settings } from './onboarding-block';
import { STORE_KEY } from './stores/onboard';
import { routes, Step } from './steps';
import { HIDE_BUTTON } from './constants';
import './style.scss';

registerBlockType( name, settings );

export function Gutenboard() {
	const { siteVertical } = useSelect( select => select( STORE_KEY ).getState() );

	// @TODO: This is currently needed in addition to the routing (inside the Onboarding Block)
	// for the 'Back' and 'Next' buttons in the header. If we remove those (and move navigation
	// entirely into the block), we'll be able to remove this code.
	const r = useRouteMatch( routes );
	let next: undefined | string;
	let prev: undefined | string;
	switch ( r?.url ) {
		case Step.IntentGathering:
			next = HIDE_BUTTON;
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
			<DropZoneProvider>
				<div className="edit-post-layout">
					<Header prev={ prev } next={ next } />
					<BlockEditorProvider
						useSubRegistry={ false }
						value={ [ onboardingBlock.current ] }
						settings={ {
							templateLock: 'all',
						} }
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
					</BlockEditorProvider>
				</div>
			</DropZoneProvider>
			<Popover.Slot />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
