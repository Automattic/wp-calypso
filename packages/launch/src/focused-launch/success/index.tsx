/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { Title } from '@automattic/onboarding';
import { Icon, external, wordpress } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { useFocusedLaunchModal, useSiteDomains } from '../../hooks';

import './style.scss';

const COPY_CONFIRMATION_MESSAGE_TIMEOUT = 3000;
const isCopyApiSupported = ! document.queryCommandSupported( 'copy' );

const Success: React.FunctionComponent = () => {
	const { siteSubdomain, sitePrimaryDomain } = useSiteDomains();
	const { unsetModalDismissible, closeFocusedLaunch } = useFocusedLaunchModal();
	const [ displayedSiteUrl, setDisplayedSiteUrl ] = useState( '' );

	const siteUrlRef = useRef< HTMLSpanElement >( null );
	const copyButtonRef = useRef< HTMLButtonElement >( null );
	const copyConfirmationMessageTimeoutRef = useRef( -1 );
	const [ isCopyConfirmationMessageVisible, setCopyConfirmationMessageVisibility ] = useState(
		false
	);

	useEffect( () => {
		setDisplayedSiteUrl( `https://${ sitePrimaryDomain?.domain }` );
	}, [ sitePrimaryDomain ] );

	// @TODO: improve rendering performance by wrapping in `useCallback`
	const handleCopyButtonClick = () => {
		const selection = getSelection();

		if ( ! siteUrlRef.current || ! selection ) {
			return;
		}

		// Select
		const range = document.createRange();
		range.selectNode( siteUrlRef.current );

		selection.addRange( range );

		try {
			if ( document.execCommand( 'copy' ) ) {
				setCopyConfirmationMessageVisibility( true );
			} else {
				// @TODO: handle copy failure (but not an error)
			}
		} catch ( e ) {
			// @TODO: handle copy errors
		}

		selection.removeAllRanges();
	};

	// Show copy confirmation message temporarily after a successfull copy to clipboard.
	useEffect( () => {
		if ( isCopyConfirmationMessageVisible ) {
			// Clear ongoing timeout before starting a new one
			if ( copyConfirmationMessageTimeoutRef.current !== -1 ) {
				clearTimeout( copyConfirmationMessageTimeoutRef.current );
			}

			copyConfirmationMessageTimeoutRef.current = setTimeout( () => {
				setCopyConfirmationMessageVisibility( false );
				copyConfirmationMessageTimeoutRef.current = -1;
			}, COPY_CONFIRMATION_MESSAGE_TIMEOUT );
		}
	}, [ isCopyConfirmationMessageVisible ] );

	// When in the Success view, the user can't dismiss the modal anymore
	useEffect( () => {
		unsetModalDismissible();
	}, [ unsetModalDismissible ] );

	return (
		<div>
			<Title>{ __( 'Hooray!', __i18n_text_domain__ ) }</Title>
			<p>
				{ __(
					"Congratulations, your website is now live. We're excited to watch you grow with WordPress.",
					__i18n_text_domain__
				) }
			</p>

			<div>
				<span ref={ siteUrlRef }>{ displayedSiteUrl }</span>
				<a href={ displayedSiteUrl } target="_blank" rel="noopener noreferrer">
					<Icon icon={ external } size={ 24 } />
				</a>
				{ isCopyApiSupported && (
					<button
						onClick={ handleCopyButtonClick }
						ref={ copyButtonRef }
						disabled={ isCopyConfirmationMessageVisible }
					>
						{ isCopyConfirmationMessageVisible
							? // translators: message shown when user successfully copies the link
							  __( 'Copied!', __i18n_text_domain__ )
							: // Translators: the action of copying the link to the clipboard
							  __( 'Copy Link', __i18n_text_domain__ ) }
					</button>
				) }
			</div>

			{ /* @TODO: this will work only when the modal in in the block editor. */ }
			<button onClick={ closeFocusedLaunch }>
				{ __( 'Continue editing', __i18n_text_domain__ ) }
			</button>

			<a href={ `/home/${ siteSubdomain?.domain }` }>{ __( 'Back home', __i18n_text_domain__ ) }</a>

			<Icon icon={ wordpress } size={ 36 } />
		</div>
	);
};

export default Success;
