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
					submitting={ props.isSubmitting }
					save={ props.save }
					submitForm={ props.submitForm }
					email={ props.invite.sentTo || '' }
					suggestedUsername=""
					className={ props.isSubmitting ? 'is-busy' : '' }
				/>
				{ renderFooterLink( props ) }
				{ props.userData && props.loginUser() }
			</div>
			{ P2InviteAcceptFooter( { translate: props.translate } ) }
		</div>
	);
};

export default P2InviteAcceptLoggedOut;
