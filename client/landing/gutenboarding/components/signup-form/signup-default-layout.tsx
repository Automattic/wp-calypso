/**
 * External dependencies
 */
import React from 'react';
import { Button, TextControl, Modal, Notice } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import type { WPElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ModalSubmitButton from '../modal-submit-button';
import './style.scss';
import SignupFormHeader from './header';

interface Props {
	closeModal: () => void;
	emailVal: string;
	errorMessage: string | undefined;
	handleSignUp: ( event: React.FormEvent< HTMLFormElement > ) => Promise< void >;
	isFetchingNewUser: boolean | undefined;
	isMobile: boolean;
	loginUrl: string;
	passwordVal: string;
	recaptcha_tos: WPElement;
	setEmailVal: React.Dispatch< React.SetStateAction< string > >;
	setPasswordVal: React.Dispatch< React.SetStateAction< string > >;
	tos: WPElement;
}

/*
 * <SignupDefaultLayout>:
 *  Gutenboarding sign-up is split into two layers.
 *  <SignupForm /> Handles the mechanics of both "regular" and "anchor.fm flavored" gutenboarding.
 *  It will render one of two components that contains a specialized layout:
 *    <SignupDefaultLayout />: "Regular" gutenboarding (/new)
 *    <SignupAnchorLayout />: "Anchor.fm flavored" gutenboarding (/new?anchor_podcast=9fa55c4)
 *  These components take the same props.
 */
const SignupDefaultLayout = ( {
	closeModal,
	emailVal,
	errorMessage,
	handleSignUp,
	isFetchingNewUser,
	isMobile,
	loginUrl,
	passwordVal,
	recaptcha_tos,
	setEmailVal,
	setPasswordVal,
	tos,
}: Props ): JSX.Element => {
	const { __ } = useI18n();

	return (
		<Modal
			className={ 'signup-form' }
			title={ __( 'Save your progress' ) }
			onRequestClose={ closeModal }
			focusOnMount={ false }
			isDismissible={ false }
			overlayClassName={ 'signup-form__overlay' }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<SignupFormHeader onRequestClose={ closeModal } />

			<div className="signup-form__body">
				<h1 className="signup-form__title">{ __( 'Save your progress' ) }</h1>

				<form onSubmit={ handleSignUp }>
					<fieldset className="signup-form__fieldset">
						<legend className="signup-form__legend">
							<p>{ __( 'Enter an email and password to save your progress and continue.' ) }</p>
						</legend>

						<TextControl
							value={ emailVal }
							disabled={ isFetchingNewUser }
							type="email"
							onChange={ setEmailVal }
							placeholder={ __( 'Email address' ) }
							required
							autoFocus={ ! isMobile } // eslint-disable-line jsx-a11y/no-autofocus
						/>

						<TextControl
							value={ passwordVal }
							disabled={ isFetchingNewUser }
							type="password"
							autoComplete="new-password"
							onChange={ setPasswordVal }
							placeholder={ __( 'Password' ) }
							required
						/>

						{ errorMessage && (
							<Notice className="signup-form__error-notice" status="error" isDismissible={ false }>
								{ errorMessage }
							</Notice>
						) }

						<div className="signup-form__footer">
							<p className="signup-form__login-link">
								<span>{ __( 'Already have an account?' ) }</span>{ ' ' }
								<Button className="signup-form__link" isLink href={ loginUrl }>
									{ __( 'Log in' ) }
								</Button>
							</p>

							<p className="signup-form__link signup-form__terms-of-service-link">{ tos }</p>

							<ModalSubmitButton disabled={ isFetchingNewUser } isBusy={ isFetchingNewUser }>
								{ __( 'Create account' ) }
							</ModalSubmitButton>

							<p className="signup-form__link signup-form__terms-of-service-link signup-form__recaptcha_tos">
								{ recaptcha_tos }
							</p>
						</div>
					</fieldset>
				</form>
			</div>

			<div id="g-recaptcha"></div>
		</Modal>
	);
};
export default SignupDefaultLayout;
