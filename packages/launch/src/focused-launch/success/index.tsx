/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { useState, useEffect, useContext } from 'react';
import { __ } from '@wordpress/i18n';
import { Title, SubTitle, NextButton, BackButton } from '@automattic/onboarding';
import { Icon, external } from '@wordpress/icons';
import { ClipboardButton } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useSiteDomains } from '../../hooks';
import Confetti from './confetti';
import LaunchContext from '../../context';
import { LAUNCH_STORE } from '../../stores';

import './style.scss';

const Success: React.FunctionComponent = () => {
	const { redirectTo } = useContext( LaunchContext );

	const { siteSubdomain, sitePrimaryDomain } = useSiteDomains();
	const { unsetModalDismissible, hideModalTitle, closeFocusedLaunch } = useDispatch( LAUNCH_STORE );
	const [ displayedSiteUrl, setDisplayedSiteUrl ] = useState( '' );

	const [ hasCopied, setHasCopied ] = useState( false );

	useEffect( () => {
		setDisplayedSiteUrl( `https://${ sitePrimaryDomain?.domain }` );
	}, [ sitePrimaryDomain ] );

	// When in the Success view, the user can't dismiss the modal anymore,
	// and the modal title is hidden
	useEffect( () => {
		unsetModalDismissible();
		hideModalTitle();
	}, [ unsetModalDismissible, hideModalTitle ] );

	const redirectToHome = () => {
		redirectTo( `/home/${ siteSubdomain?.domain }` );
	};

	return (
		<div className="focused-launch-success">
			<div className="focused-launch-success__wrapper">
				<Confetti className="focused-launch-success__confetti" />
				<Title>{ __( 'Hooray!', __i18n_text_domain__ ) }</Title>
				<SubTitle>
					{ __(
						"Congratulations, your website is now live. We're excited to watch you grow with WordPress.",
						__i18n_text_domain__
					) }
				</SubTitle>

				<div className="focused-launch-success__url-wrapper">
					<span className="focused-launch-success__url-field">{ displayedSiteUrl }</span>
					<a
						href={ displayedSiteUrl }
						target="_blank"
						rel="noopener noreferrer"
						className="focused-launch-success__url-link"
						// translators: text accessible to screen readers
						aria-label={ __( 'Visit site', __i18n_text_domain__ ) }
					>
						<Icon icon={ external } size={ 16 } />
					</a>
					<ClipboardButton
						text={ displayedSiteUrl }
						onCopy={ () => setHasCopied( true ) }
						onFinishCopy={ () => setHasCopied( false ) }
						className="focused-launch-success__url-copy-button"
					>
						{ hasCopied
							? __( 'Copied!', __i18n_text_domain__ )
							: __( 'Copy Link', __i18n_text_domain__ ) }
					</ClipboardButton>
				</div>

				{ /* @TODO: this will work only when the modal in in the block editor. */ }
				<NextButton
					onClick={ closeFocusedLaunch }
					className="focused-launch-success__continue-editing-button"
				>
					{ __( 'Continue Editing', __i18n_text_domain__ ) }
				</NextButton>

				<BackButton onClick={ redirectToHome }>
					{ __( 'Back home', __i18n_text_domain__ ) }
				</BackButton>
			</div>
		</div>
	);
};

export default Success;
