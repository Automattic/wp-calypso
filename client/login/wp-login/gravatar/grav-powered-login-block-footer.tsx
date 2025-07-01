import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSignupUrl } from 'calypso/lib/login';
import { isGravatarFlowOAuth2Client, isGravatarOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login, lostPassword } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

const GravPoweredLoginBlockFooter = () => {
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const locale = useSelector( getCurrentLocaleSlug );
	/**
	 * TODO: This is a temporary type assertion to fix the type error.
	 * Create a selector that returns the current query arguments as a record, or pass the type to the selector.
	 */
	const currentQuery = useSelector( getCurrentQueryArguments ) as
		| Record< string, string >
		| undefined;
	const currentRoute = useSelector( getCurrentRoute );
	const translate = useTranslate();

	const isGravatar = isGravatarOAuth2Client( oauth2Client );
	const isFromGravatar3rdPartyApp = isGravatar && currentQuery?.gravatar_from === '3rd-party';
	const isFromGravatarQuickEditor = isGravatar && currentQuery?.gravatar_from === 'quick-editor';
	const isGravatarFlow = isGravatarFlowOAuth2Client( oauth2Client );
	const isGravatarFlowWithEmail = !! ( isGravatarFlow && currentQuery?.email_address );
	const shouldShowSignupLink =
		! isFromGravatar3rdPartyApp && ! isFromGravatarQuickEditor && ! isGravatarFlowWithEmail;
	const magicLoginUrl = login( {
		locale,
		twoFactorAuthType: 'link',
		oauth2ClientId: currentQuery?.client_id,
		redirectTo: currentQuery?.redirect_to,
		gravatarFrom: currentQuery?.gravatar_from,
		gravatarFlow: isGravatarFlow,
		emailAddress: currentQuery?.email_address,
	} );
	const currentUrl = new URL( window.location.href );
	currentUrl.searchParams.append( 'lostpassword_flow', 'true' );
	const lostPasswordUrl = addQueryArgs(
		{
			redirect_to: currentUrl.toString(),
			client_id: currentQuery?.client_id,
		},
		lostPassword( { locale } )
	);
	const signupUrl = getSignupUrl( currentQuery, currentRoute, oauth2Client, locale );

	return (
		<>
			<hr className="grav-powered-login__divider" />
			<div className="grav-powered-login__footer">
				<a
					href={ magicLoginUrl }
					onClick={ () => recordTracksEvent( 'calypso_login_magic_login_request_click' ) }
				>
					{ isGravatar
						? translate( 'Email me a login code.' )
						: translate( 'Email me a login link.' ) }
				</a>
				<a
					href={ lostPasswordUrl }
					onClick={ () => recordTracksEvent( 'calypso_login_reset_password_link_click' ) }
				>
					{ translate( 'Lost your password?' ) }
				</a>
				{ shouldShowSignupLink && (
					<div>
						{ translate( 'You have no account yet? {{signupLink}}Create one{{/signupLink}}.', {
							components: {
								signupLink: <a href={ signupUrl } />,
							},
						} ) }
					</div>
				) }
				<div>
					{ translate( 'Any question? {{a}}Check our help docs{{/a}}.', {
						components: {
							a: <a href="https://gravatar.com/support" target="_blank" rel="noreferrer" />,
						},
					} ) }
				</div>
			</div>
		</>
	);
};

export default GravPoweredLoginBlockFooter;
