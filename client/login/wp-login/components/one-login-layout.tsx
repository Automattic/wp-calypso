import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import clsx from 'clsx';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { type JSX } from 'react';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import { useLoginContext } from 'calypso/login/login-context';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import useSignupLink from '../hooks/use-signup-link';
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
	isFromJetpackConnector?: boolean;
	/**
	 * Jetpack onboarding or connector flow, which the user is completing from a
	 * Jetpack site.
	 */
	isUnifiedConnectionFlow?: boolean;
	connectorPlugins?: string[];
	children: React.ReactNode;
	/**
	 * `signupUrl` prop should merge with `getSignupLinkComponent` logic in `/client/block/login/index.js`, so we have a single source for this logic.
	 */
	signupUrl?: string;
	isSectionSignup?: boolean;
	loginUrl?: string;
	isLostPasswordView?: boolean;
	/**
	 * Takes the top-right slot when provided, displacing the "Create an account" link, which the
	 * main login view moves to its footer. Pass it only from views that actually offer password
	 * recovery: mid-flow screens like 2FA have none and keep the signup link up there.
	 */
	lostPasswordLink?: JSX.Element | null;
	noThanksRedirectUrl?: string;
	/**
	 * Optional override for the content column width passed to `Step.CenteredColumnLayout`. Defaults to 6.
	 */
	columnWidth?: 4 | 5 | 6 | 8 | 10;
	/**
	 * Optional flag to control whether the heading logo should be displayed. Defaults to true.
	 */
	showLogo?: boolean;
	/**
	 * When true, the primary subtext slot is rendered in the dotcom-prominent
	 * variant (slightly darker text color and a step up on the typography
	 * scale). Use it when the primary line is a real subtitle rather than the
	 * default quiet ToS treatment.
	 */
	subHeadingProminent?: boolean;
	/**
	 * Rendered above the heading. Pass a component that returns `null` when it
	 * has nothing to show, so the layout keeps its spacing.
	 */
	notice?: React.ReactNode;
	/**
	 * Links the top bar WordPress.com logo to the homepage. Never applies to
	 * Jetpack, Woo JPC, OAuth2 client or partner-branded logins.
	 */
	linkLogoToHome?: boolean;
}

const OneLoginLayout = ( {
	isJetpack,
	isFromJetpackConnector,
	isUnifiedConnectionFlow,
	connectorPlugins,
	children,
	signupUrl: signupUrlProp,
	isSectionSignup,
	loginUrl,
	isLostPasswordView,
	lostPasswordLink,
	noThanksRedirectUrl,
	columnWidth,
	showLogo = true,
	subHeadingProminent = false,
	notice,
	linkLogoToHome = false,
}: OneLoginLayoutProps ) => {
	const translate = useTranslate();
	const urlLocale = useLocale();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const userLocale = useSelector( getCurrentUserLocale );
	// For logged-in users, use their user locale setting. For logged-out users, use URL locale.
	const locale = isLoggedIn && userLocale ? userLocale : urlLocale;
	const currentRoute = useSelector( getCurrentRoute );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isWooJPC = useSelector( isWooJPCFlow );
	const { headingText, subHeadingText, subHeadingTextSecondary } = useLoginContext();
	const validatedHeadingText = ensureHeadingProvided( headingText );
	const { topBarLogo, hasCustomBranding } = usePartnerBranding();
	const signupLink = useSignupLink( { signupUrl: signupUrlProp, origin: 'login-layout' } );

	const SignUpLink = () => {
		if ( isLostPasswordView ) {
			return null;
		}

		return (
			<Step.LinkButton
				href={ signupLink.href }
				key="sign-up-link"
				onClick={ signupLink.onClick }
				rel="external"
			>
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

	const shouldLinkLogo =
		linkLogoToHome &&
		! isJetpack &&
		! isFromJetpackConnector &&
		! isUnifiedConnectionFlow &&
		! isWooJPC &&
		! oauth2Client &&
		! hasCustomBranding;

	const handleLogoClick = () => {
		recordTracksEvent( isSectionSignup ? 'calypso_signup_logo_click' : 'calypso_login_logo_click', {
			page: currentRoute,
		} );
	};

	const topBar = (): JSX.Element => {
		// On the main login view the route to signup moves down to the footer, matching where
		// signup puts its route to login, and password recovery takes the slot it vacates.
		// Everywhere else (2FA, magic login, the OAuth2 screen) the top bar is unchanged: those
		// are mid-flow screens with no lost-password link to promote.
		const rightElement = (
			<nav className="wp-login__one-login-layout-top-right">
				{ lostPasswordLink ?? ( isSectionSignup ? <LoginLink /> : <SignUpLink /> ) }
				{ noThanksRedirectUrl && <NoThanksLink /> }
			</nav>
		);

		return (
			<Step.TopBar
				rightElement={ rightElement }
				logo={ topBarLogo }
				logoHref={ shouldLinkLogo ? localizeUrl( 'https://wordpress.com/', locale ) : undefined }
				onLogoClick={ shouldLinkLogo ? handleLogoClick : undefined }
			/>
		);
	};

	const effectiveColumnWidth: 4 | 5 | 6 | 8 | 10 = ( columnWidth ?? 6 ) as 4 | 5 | 6 | 8 | 10;

	return (
		<Step.CenteredColumnLayout
			columnWidth={ effectiveColumnWidth }
			topBar={ topBar() }
			verticalAlign="center"
		>
			<div className="wp-login__one-login-layout-content-wrapper">
				{ notice }
				<div className="wp-login__one-login-layout-heading">
					{ showLogo && (
						<HeadingLogo
							isJetpack={ isJetpack }
							isFromJetpackConnector={ isFromJetpackConnector }
							connectorPlugins={ connectorPlugins }
						/>
					) }
					<Step.Heading
						text={
							<div className="wp-login__one-login-layout-heading-text">
								{ validatedHeadingText }
							</div>
						}
					/>
					<div className="wp-login__one-login-layout-heading-subtext-wrapper">
						<h2
							className={ clsx( 'wp-login__one-login-layout-heading-subtext', {
								'is-prominent': subHeadingProminent,
							} ) }
						>
							{ subHeadingText }
						</h2>
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
