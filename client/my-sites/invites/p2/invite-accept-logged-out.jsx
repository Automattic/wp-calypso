/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SignupForm from 'calypso/blocks/signup-form';

export function renderInviteAcceptForP2( props ) {
	return (
		<div>
			<SignupForm
				redirectToAfterLoginUrl={ window.location.href }
				disabled={ props.isSubmitting }
				formHeader={ props.formHeader }
				submitting={ props.isSubmitting }
				save={ props.save }
				submitForm={ props.submitForm }
				submitButtonText={ props.submitButtonText }
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
	);
}
