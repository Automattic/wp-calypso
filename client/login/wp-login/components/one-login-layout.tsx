import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
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

export const ensureHeadingProvided = (
	heading: TranslateResult | null | undefined
): TranslateResult | null => {
	if ( process.env.NODE_ENV !== 'production' && ( heading === undefined || heading === null ) ) {
		throw new Error(
			'OneLoginLayout rendered without heading text. Seed LoginContextProvider before render.'
		);
	}

	return heading ?? null;
};

interface OneLoginLayoutProps {
	isJetpack: boolean;
	children: React.ReactNode;
	/**
	 * `signupUrl` prop should merge with `getSignupLinkComponent` logic in `/client/block/login/index.js`, so we have a single source for this logic.
	 */
	signupUrl?: string;
	isSectionSignup?: boolean;
	loginUrl?: string;
	isLostPasswordView?: boolean;
	noThanksRedirectUrl?: string;
	/**
	 * Optional override for the content column width passed to `Step.CenteredColumnLayout`. Defaults to 6.
	 */
	columnWidth?: 4 | 5 | 6 | 8 | 10;
	/**
	 * Optional flag to control whether the heading logo should be displayed. Defaults to true.
	 */
	showLogo?: boolean;
}

const OneLoginLayout = ( {
	isJetpack,
	children,
	signupUrl: signupUrlProp,
	isSectionSignup,
	loginUrl,
	isLostPasswordView,
	noThanksRedirectUrl,
	columnWidth,
	showLogo = true,
}: OneLoginLayoutProps ) => {
	const translate = useTranslate();
	const urlLocale = useLocale();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const userLocale = useSelector( getCurrentUserLocale );
	// For logged-in users, use their user locale setting. For logged-out users, use URL locale.
	const locale = isLoggedIn && userLocale ? userLocale : urlLocale;
	const currentRoute = useSelector( getCurrentRoute );
	const currentQuery = useSelector( getCurrentQueryArguments );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const dispatch = useDispatch();
	const { headingText, subHeadingText, subHeadingTextSecondary } = useLoginContext();
	const validatedHeadingText = ensureHeadingProvided( headingText );

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

		if ( isLostPasswordView ) {
			return null;
		}

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

	const NoThanksLink = () => {
		if ( ! noThanksRedirectUrl ) {
			return null;
		}

		const handleClick = () => {
			recordTracksEvent( 'calypso_login_no_thanks_click', {
				page: currentRoute,
			} );
		};

		const href = noThanksRedirectUrl;

		return (
			<Step.LinkButton href={ href } key="no-thanks-link" rel="external" onClick={ handleClick }>
				{ translate( 'No, thanks' ) }
			</Step.LinkButton>
		);
	};

	const topBar = (): JSX.Element => {
		const rightElement = (
			<nav className="wp-login__one-login-layout-top-right">
				{ isSectionSignup ? <LoginLink /> : <SignUpLink /> }
				{ noThanksRedirectUrl && <NoThanksLink /> }
			</nav>
		);

		return <Step.TopBar rightElement={ rightElement } compactLogo="always" />;
	};

	const effectiveColumnWidth: 4 | 5 | 6 | 8 | 10 = ( columnWidth ?? 6 ) as 4 | 5 | 6 | 8 | 10;

	return (
		<Step.CenteredColumnLayout
			columnWidth={ effectiveColumnWidth }
			topBar={ topBar() }
			verticalAlign="center"
		>
			<div className="wp-login__one-login-layout-content-wrapper">
				<div className="wp-login__one-login-layout-heading">
					{ showLogo && <HeadingLogo isJetpack={ isJetpack } /> }
					<Step.Heading
						text={
							<div className="wp-login__one-login-layout-heading-text">
								{ validatedHeadingText }
							</div>
						}
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
