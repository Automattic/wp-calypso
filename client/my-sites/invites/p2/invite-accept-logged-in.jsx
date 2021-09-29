import { Button } from '@automattic/components';
import Gravatar from 'calypso/components/gravatar';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import P2InviteAcceptFooter from './invite-accept-footer';
import P2InviteAcceptHeader from './invite-accept-header';

import './style.scss';

const P2InviteAcceptLoggedIn = ( props ) => {
	return (
		<div>
			<div className="invite-accept-logged-in__form-container">
				{ P2InviteAcceptHeader( { site: props.invite.site, translate: props.translate } ) }
				<div className="invite-accept-logged-in__join-as">
					<Gravatar user={ props.user } size={ 72 } />
					<div className="invite-accept-logged-in__join-as-text">
						{ /* { props.translate( "You'll join as {{usernameWrap}}%(username)s{{/usernameWrap}}", {
							components: {
								usernameWrap: <span className="invite-accept-logged-in__join-as-username" />,
							},
							args: {
								username: props.user && props.user.display_name,
							},
						} ) } */ }
						{ props.joinAsText }
					</div>
					<LoggedOutFormLinks>
						<LoggedOutFormLinkItem onClick={ props.signIn } href={ props.signInLink }>
							{ props.translate( 'Sign in as a different user' ) }
						</LoggedOutFormLinkItem>
					</LoggedOutFormLinks>
				</div>

				<div className="invite-accept-logged-in__buttons">
					<Button
						primary
						onClick={ props.accept }
						disabled={ props.isSubmitting }
						className={ props.isSubmitting ? 'is-busy' : '' }
					>
						{ ! props.isSubmitting ? props.buttonText : '' }
					</Button>
					<Button onClick={ props.decline } disabled={ props.isSubmitting }>
						{ props.translate( 'Cancel', { context: 'button' } ) }
					</Button>
				</div>
			</div>
			{ P2InviteAcceptFooter( { translate: props.translate } ) }
		</div>
	);
};

export default P2InviteAcceptLoggedIn;
