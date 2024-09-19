import SignupForm from 'calypso/blocks/signup-form';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import P2InviteAcceptFooter from './invite-accept-footer';
import P2InviteAcceptHeader from './invite-accept-header';

function renderFooterLink( props ) {
	return (
		<div className="invite-accept-logged-out__footer-link">
			<div>{ props.translate( 'Already have a WordPress.com account?' ) }</div>
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem onClick={ props.onClickSignInLink }>
					{ props.translate( 'Log in instead' ) }
				</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		</div>
	);
}

const P2InviteAcceptLoggedOut = ( props ) => {
	return (
		<div>
			<div className="invite-accept-logged-out__form-container">
				{ P2InviteAcceptHeader( { site: props.invite.site, translate: props.translate } ) }
				<SignupForm
					isPasswordless
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
					className={ props.isSubmitting ? 'is-busy' : '' }
				/>
				{ props.userData && props.loginUser() }
			</div>
			{ P2InviteAcceptFooter( { translate: props.translate } ) }
		</div>
	);
};

export default P2InviteAcceptLoggedOut;
