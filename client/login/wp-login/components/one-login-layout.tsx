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
import HeadingLogo, { useHeadingLogo } from './heading-logo';
import 'calypso/components/account-template/style.scss';
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
	showsUnifiedContent?: boolean;
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
	 * Keeps the "Create an account" link in the top bar below 960px only. The main login view
	 * passes this in the entry clarity treatment, where its footer carries the route to signup on
	 * desktop.
	 */
	signupLinkMobileOnly?: boolean;
	noThanksRedirectUrl?: string;
	/**
	 * Optional override for the content column width passed to `Step.CenteredColumnLayout`.
	 * Defaults to 4, the 432px column every account screen shares, or 6 with a logo above the title.
	 */
	columnWidth?: 4 | 5 | 6 | 8 | 10;
	/**
	 * Centers the heading over a wider layout, like the main login screen's side-by-side
	 * form and social buttons. Defaults to left-aligned, or centered with a logo above the title.
	 */
	isCentered?: boolean;
	/**
	 * Optional flag to control whether the heading logo should be displayed. Defaults to true.
	 */
	showLogo?: boolean;
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
	showsUnifiedContent,
	isUnifiedConnectionFlow,
	connectorPlugins,
	children,
	signupUrl: signupUrlProp,
	isSectionSignup,
	loginUrl,
	isLostPasswordView,
	signupLinkMobileOnly,
	noThanksRedirectUrl,
	columnWidth: columnWidthProp,
	isCentered: isCenteredProp,
	showLogo = true,
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
	const { headingText, subHeadingText, subHeadingTextSecondary, siteIcon } = useLoginContext();
	const validatedHeadingText = ensureHeadingProvided( headingText );
	const { topBarLogo, hasCustomBranding } = usePartnerBranding();
	const signupLink = useSignupLink( { signupUrl: signupUrlProp, origin: 'login-layout' } );
	const headingLogo = useHeadingLogo( { isJetpack, showsUnifiedContent, connectorPlugins } );

	// Product and partner logins with a logo above the title (Woo, Jetpack, Crowdsignal,
	// Akismet...) are designed around it, so they stay centered. A logo in the top bar
	// doesn't count: those screens follow the account template.
	const hasLogoAboveTitle = showLogo && headingLogo !== null;
	const columnWidth = columnWidthProp ?? ( hasLogoAboveTitle ? 6 : 4 );
	const isCentered = isCenteredProp ?? hasLogoAboveTitle;

	const renderSignUpLink = () => {
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

	const renderLoginLink = () => {
		if ( ! loginUrl ) {
			return null;
		}

		return (
			<Step.LinkButton href={ loginUrl } key="login-link" rel="external">
				{ translate( 'Log in' ) }
			</Step.LinkButton>
		);
	};

	const renderNoThanksLink = () => {
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
		! showsUnifiedContent &&
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
		const signupOrLoginLink = isSectionSignup ? renderLoginLink() : renderSignUpLink();

		// Hidden in CSS rather than by a viewport hook: the page is server-rendered, so a hook
		// would render the mobile arrangement and jump on hydration.
		const rightElement = (
			<nav className="wp-login__one-login-layout-top-right account-template__top-bar-links">
				{ signupLinkMobileOnly ? (
					<span className="wp-login__top-right-mobile">{ signupOrLoginLink }</span>
				) : (
					signupOrLoginLink
				) }
				{ renderNoThanksLink() }
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

	return (
		<Step.CenteredColumnLayout
			columnWidth={ columnWidth }
			topBar={ topBar() }
			verticalAlign="center"
		>
			<div
				className={ clsx( 'wp-login__one-login-layout-content-wrapper', 'account-template', {
					'is-centered': isCentered,
				} ) }
			>
				{ notice }
				<div className="wp-login__one-login-layout-heading">
					{ showLogo && ! headingLogo && siteIcon && (
						<div className="wp-login__one-login-layout-heading-logo is-site-icon">
							<img src={ siteIcon.src } width={ 64 } height={ 64 } alt={ siteIcon.alt } />
						</div>
					) }
					{ showLogo && (
						<HeadingLogo
							isJetpack={ isJetpack }
							showsUnifiedContent={ showsUnifiedContent }
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
