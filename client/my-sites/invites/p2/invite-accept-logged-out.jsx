/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SignupForm from 'calypso/blocks/signup-form';
import { renderInviteAcceptP2Logo } from './invite-accept-logo-line';
import { renderInviteAcceptFormHeader } from './invite-accept-form-header';
import { renderInviteAcceptFooter } from './invite-accept-footer';

export function renderInviteAcceptForP2( props ) {
	return (
		<div>
			{ renderInviteAcceptP2Logo( { translate: props.translate } ) }
			<div className="invite-accept-logged-out__form-container">
				{ renderInviteAcceptFormHeader( { site: props.invite.site, translate: props.translate } ) }
				<SignupForm
					redirectToAfterLoginUrl={ window.location.href }
					disabled={ props.isSubmitting }
					formHeader={ '' }
					submitting={ props.isSubmitting }
					save={ props.save }
					submitForm={ props.submitForm }
					submitButtonText={ props.isSubmitting ? '' : props.submitButtonText }
					footerLink={ props.footerLink }
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
