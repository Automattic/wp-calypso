/**
 * External dependencies
 */
import '@wordpress/editor'; // This shouldn't be necessary
import { useI18n } from '@automattic/react-i18n';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { Popover, DropZoneProvider } from '@wordpress/components';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import '@wordpress/format-library';
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';

// Uncomment and remove the redundant sass import from `./style.css` when a release after @wordpress/components@8.5.0 is published.
// See https://github.com/WordPress/gutenberg/pull/19535
// import '@wordpress/components/build-style/style.css';

/**
 * Internal dependencies
 */
import Header from './components/header';
import { name, settings } from './onboarding-block';
import { Step, usePath } from './path';
import './style.scss';

registerBlockType( name, settings );

export function Gutenboard() {
	const { __: NO__ } = useI18n();

	// @TODO: This is currently needed in addition to the routing (inside the Onboarding Block)
	// for the 'Back' and 'Next' buttons in the header. If we remove those (and move navigation
	// entirely into the block), we'll be able to remove this code.
	const { step } = useParams();
	const makePath = usePath();
	let prev: undefined | string;
	switch ( step ) {
		case Step.DesignSelection:
			prev = makePath( Step.IntentGathering );
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
					<Header prev={ prev } />
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
								<BlockList className="gutenboarding-block-list" />
							</div>
						</div>
					</BlockEditorProvider>
					<div>Your locale: { useI18n().i18nLocale }</div>
					<div>__( 'Next' ): { useI18n().__( 'Next' ) }</div>
				</div>
			</DropZoneProvider>
			<Popover.Slot />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
