/**
 * External dependencies
 */
import React from 'react';
import { Button, TextControl, Modal, Notice } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
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

const SignupDisplayAnchor = ( {
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
}: Props ) => {
	const { __ } = useI18n();

	const form = (
		<form onSubmit={ handleSignUp }>
			<fieldset className="signup-form__fieldset">
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
	);

	return (
		<Modal
			className={ 'signup-form' }
			title={ __( 'Create your podcast site with WordPress.com' ) }
			onRequestClose={ closeModal }
			focusOnMount={ false }
			isDismissible={ false }
			overlayClassName={ 'signup-form__overlay' }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<SignupFormHeader onRequestClose={ closeModal } />

			<div className="signup-form__anchor-body">
				<h1 className="signup-form__title">
					{ __( 'Create your podcast site with WordPress.com' ) }
				</h1>
				<div className="signup-form__anchor-subheading">
					<p>{ __( 'Create a WordPress.com account and start creating your free site.' ) }</p>
				</div>

				<div className="signup-form__anchor-row">
					{ /* Left Column: Contains Form */ }
					<div className="signup-form__anchor-col">
						<div className="signup-form__anchor-col-left-container">{ form }</div>
					</div>

					<div className="signup-form__anchor-separator" aria-hidden="true" role="presentation" />

					{ /* Right Column: Contains Marketing Text */ }
					<div className="signup-form__anchor-col">
						<div className="signup-form__anchor-col-right-container">
							<div className="signup-form__anchor-col-right-group">
								<div className="signup-form__anchor-right-heading">
									{ __(
										'Turn your listeners into customers with the marketing power of a website'
									) }
								</div>
								<div>
									<ul className="signup-form__anchor-list">
										<li>Create forms and mailing lists</li>
										<li>Accept Payments and sell merchandise</li>
										<li>Built-in SEO and social tools</li>
									</ul>
								</div>
							</div>

							<div className="signup-form__anchor-col-right-group">
								<div className="signup-form__anchor-right-heading">
									Increase your audience with episode transcriptions
								</div>
								<div>
									<ul className="signup-form__anchor-list">
										<li>Add transcriptions to episode pages</li>
										<li>Customizable templates built for podcasts</li>
										<li>Add images, videos, and text formatting</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div id="g-recaptcha"></div>
		</Modal>
	);
};
export default SignupDisplayAnchor;
