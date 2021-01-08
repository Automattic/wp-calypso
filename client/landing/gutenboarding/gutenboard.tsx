/**
 * External dependencies
 */
import * as React from 'react';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { Popover, DropZoneProvider } from '@wordpress/components';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import '@wordpress/format-library';
import { useI18n } from '@automattic/react-i18n';

// Uncomment and remove the redundant sass import from `./style.css` when a release after @wordpress/components@8.5.0 is published.
// See https://github.com/WordPress/gutenberg/pull/19535
// import '@wordpress/components/build-style/style.css';

/**
 * Internal dependencies
 */
import Header from './components/header';
import SignupForm from './components/signup-form';
import { name, settings } from './onboarding-block';
import { fontPairings, getFontTitle } from './constants';
import useOnSiteCreation from './hooks/use-on-site-creation';
import { usePageViewTracksEvents } from './hooks/use-page-view-tracks-events';
import useSignup from './hooks/use-signup';
import useOnSignup from './hooks/use-on-signup';
import useOnLogin from './hooks/use-on-login';
import useSiteTitle from './hooks/use-site-title';
import useTrackOnboardingStart from './hooks/use-track-onboarding-start';

import './style.scss';

registerBlockType( name, settings );

const Gutenboard: React.FunctionComponent = () => {
	const { __ } = useI18n();
	useOnLogin();
	useOnSignup();
	useOnSiteCreation();
	usePageViewTracksEvents();
	useTrackOnboardingStart();
	useSiteTitle();
	const { showSignupDialog, onSignupDialogClose } = useSignup();

	// TODO: Explore alternatives for loading fonts and optimizations
	// TODO: Don't load like this
	React.useEffect( () => {
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
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// @TODO: This is currently needed in addition to the routing (inside the Onboarding Block)
	// for the 'Back' and 'Next' buttons in the header. If we remove those (and move navigation
	// entirely into the block), we'll be able to remove this code.

	// We're persisting the block via `useRef` in order to prevent re-renders
	// which would collide with the routing done inside of the block
	// (and would lead to weird mounting/unmounting behavior).
	const onboardingBlock = React.useRef( createBlock( name, {} ) );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="block-editor__container">
			<DropZoneProvider>
				<div className="gutenboarding__layout edit-post-layout">
					<Header />
					{ showSignupDialog && <SignupForm onRequestClose={ onSignupDialogClose } /> }
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
								<BlockList />
							</div>
						</div>
					</BlockEditorProvider>
				</div>
			</DropZoneProvider>
			<Popover.Slot />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Gutenboard;
