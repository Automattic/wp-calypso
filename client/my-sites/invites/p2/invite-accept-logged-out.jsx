/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SignupForm from 'calypso/blocks/signup-form';
import { renderInviteAcceptFormHeader } from './invite-accept-form-header';
import { renderInviteAcceptFooter } from './invite-accept-footer';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';

function renderFooterLink( props ) {
	return (
		<div className="invite-accept-logged-out__footer-link">
			<div>{ props.translate( 'Already have a WordPress.com account? ' ) }</div>
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem onClick={ props.onClickSignInLink }>
					{ props.translate( 'Log in instead.' ) }
				</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		</div>
	);
}

export function renderInviteAcceptForP2( props ) {
	return (
		<div>
			<div className="invite-accept-logged-out__form-container">
				{ renderInviteAcceptFormHeader( { site: props.invite.site, translate: props.translate } ) }
				<SignupForm
					redirectToAfterLoginUrl={ window.location.href }
					disabled={ props.isSubmitting }
					formHeader=""
					submitting={ props.isSubmitting }
					save={ props.save }
					submitForm={ props.submitForm }
					submitButtonText={ props.isSubmitting ? '' : props.translate( 'Sign up and join' ) }
					footerLink={ renderFooterLink( props ) }
					email={ props.invite.sentTo || '' }
					suggestedUsername=""
					disableEmailInput={ props.forceMatchingEmail }
					disableEmailExplanation={ props.translate( 'This invite is only valid for %(email)s.', {
						args: { email: props.invite.sentTo },
					} ) }
				/>
				{ props.userData && props.loginUser() }
			</div>
			{ renderInviteAcceptFooter( { translate: props.translate } ) }
		</div>
	);
}
