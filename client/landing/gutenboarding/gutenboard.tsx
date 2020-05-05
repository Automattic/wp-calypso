/**
 * External dependencies
 */
import { useI18n } from '@automattic/react-i18n';
import { BlockEditorProvider, BlockList as OriginalBlockList } from '@wordpress/block-editor';
import { Popover, DropZoneProvider } from '@wordpress/components';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import '@wordpress/format-library';
import React, { useRef, useEffect } from 'react';

// Uncomment and remove the redundant sass import from `./style.css` when a release after @wordpress/components@8.5.0 is published.
// See https://github.com/WordPress/gutenberg/pull/19535
// import '@wordpress/components/build-style/style.css';

/**
 * Internal dependencies
 */
import Header from './components/header';
import { name, settings } from './onboarding-block';
import './style.scss';
import { fontPairings, getFontTitle } from './constants';
import { recordOnboardingStart } from './lib/analytics';

registerBlockType( name, settings );

interface BlockListProps extends OriginalBlockList.Props {
	__experimentalUIParts: {
		hasPopover: boolean;
		hasSelectedUI: boolean;
	};
}

const BlockList = ( props: BlockListProps ) => <OriginalBlockList { ...props } />;

export function Gutenboard() {
	const { __ } = useI18n();

	// TODO: Explore alternatives for loading fonts and optimizations
	// TODO: Don't load like this
	useEffect( () => {
		fontPairings.forEach( ( { base, headings } ) => {
			const linkBase = document.createElement( 'link' );
			const linkHeadings = document.createElement( 'link' );

			linkBase.href = `https://fonts.googleapis.com/css2?family=${ encodeURI(
				base
			) }&text=${ encodeURI( getFontTitle( base ) ) }&display=swap`;
			linkHeadings.href = `https://fonts.googleapis.com/css2?family=${ encodeURI(
				headings
			) }:wght@700&text=${ encodeURI( getFontTitle( headings ) ) }&display=swap`;

			linkBase.rel = 'stylesheet';
			linkHeadings.rel = 'stylesheet';

			linkBase.type = 'text/css';
			linkHeadings.type = 'text/css';

			document.head.appendChild( linkBase );
			document.head.appendChild( linkHeadings );
		} );

		recordOnboardingStart();
	}, [] );

	// @TODO: This is currently needed in addition to the routing (inside the Onboarding Block)
	// for the 'Back' and 'Next' buttons in the header. If we remove those (and move navigation
	// entirely into the block), we'll be able to remove this code.

	// We're persisting the block via `useRef` in order to prevent re-renders
	// which would collide with the routing done inside of the block
	// (and would lead to weird mounting/unmounting behavior).
	const onboardingBlock = useRef( createBlock( name, {} ) );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="block-editor__container">
			<DropZoneProvider>
				<div className="gutenboarding__layout edit-post-layout">
					<Header />
					<BlockEditorProvider
						useSubRegistry={ false }
						value={ [ onboardingBlock.current ] }
						settings={ {
							templateLock: 'all',
							alignWide: true,
						} }
					>
						<div className="gutenboarding__content edit-post-layout__content">
							<div
								className="gutenboarding__content-editor edit-post-visual-editor editor-styles-wrapper"
								role="region"
								aria-label={ __( 'Onboarding screen content' ) }
								tabIndex={ -1 }
							>
								<BlockList
									__experimentalUIParts={ {
										hasPopover: false,
										hasSelectedUI: false,
									} }
								/>
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
