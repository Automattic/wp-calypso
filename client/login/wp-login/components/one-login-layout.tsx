import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import { useLoginContext } from 'calypso/login/login-context';
import { useDispatch, useSelector } from 'calypso/state';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { isUserLoggedIn, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import HeadingLogo from './heading-logo';
import './one-login-layout.scss';

interface OneLoginLayoutProps {
	isJetpack: boolean;
	isFromAkismet: boolean;
	children: React.ReactNode;
	/**
	 * `signupUrl` prop should merge with `getSignupLinkComponent` logic in `/client/block/login/index.js`, so we have a single source for this logic.
	 */
	signupUrl?: string;
	isSectionSignup?: boolean;
	loginUrl?: string;
}

const OneLoginLayout = ( {
	isJetpack,
	isFromAkismet,
	children,
	signupUrl: signupUrlProp,
	isSectionSignup,
	loginUrl,
}: OneLoginLayoutProps ) => {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );
	const currentRoute = useSelector( getCurrentRoute );
	const currentQuery = useSelector( getCurrentQueryArguments );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const dispatch = useDispatch();
	const { headingText, subHeadingText, subHeadingTextSecondary } = useLoginContext();

	const SignUpLink = () => {
		// use '?signup_url' if explicitly passed as URL query param
		const signupUrl: string = signupUrlProp
			? window.location.origin + pathWithLeadingSlash( signupUrlProp )
			: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale );

		const handleClick = ( event: React.MouseEvent< HTMLElement > ) => {
			recordTracksEvent( 'calypso_login_sign_up_link_click', { origin: 'login-layout' } );

			if ( isLoggedIn ) {
				event.preventDefault();
				dispatch( redirectToLogout( signupUrl ) );
			}
		};

		return (
			<Step.LinkButton href={ signupUrl } key="sign-up-link" onClick={ handleClick } rel="external">
				{ translate( 'Create an account' ) }
			</Step.LinkButton>
		);
	};

	const LoginLink = () => {
		if ( ! loginUrl ) {
			return null;
		}

		return (
			<Step.LinkButton href={ loginUrl } key="login-link" rel="external">
				{ translate( 'Log in' ) }
			</Step.LinkButton>
		);
	};

	return (
		<Step.CenteredColumnLayout
			columnWidth={ 6 }
			topBar={
				<Step.TopBar
					rightElement={ isSectionSignup ? <LoginLink /> : <SignUpLink /> }
					compactLogo="always"
				/>
			}
			verticalAlign="center"
		>
			<div className="wp-login__one-login-layout-content-wrapper">
				<div className="wp-login__one-login-layout-heading">
					<HeadingLogo isFromAkismet={ isFromAkismet } isJetpack={ isJetpack } />
					<Step.Heading
						text={ <div className="wp-login__one-login-layout-heading-text">{ headingText }</div> }
					/>
					<div className="wp-login__one-login-layout-heading-subtext-wrapper">
						<h2 className="wp-login__one-login-layout-heading-subtext">{ subHeadingText }</h2>
						{ subHeadingTextSecondary && (
							<h3 className="wp-login__one-login-layout-heading-subtext is-secondary">
								{ subHeadingTextSecondary }
							</h3>
						) }
					</div>
				</div>
				{ children }
			</div>
		</Step.CenteredColumnLayout>
	);
};

export default OneLoginLayout;
