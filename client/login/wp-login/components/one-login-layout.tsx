import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Step } from '@automattic/onboarding';
import clsx from 'clsx';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { type JSX } from 'react';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import { useLoginContext } from 'calypso/login/login-context';
import { useSelector } from 'calypso/state';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
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
	 * passes this: on desktop its footer carries the route to signup instead, matching signup,
	 * and the top bar's right side is left empty, also matching signup. Mid-flow screens like
	 * 2FA keep the link up there at every width.
	 */
	signupLinkMobileOnly?: boolean;
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
}

const OneLoginLayout = ( {
	isJetpack,
	isFromJetpackConnector,
	connectorPlugins,
	children,
	signupUrl: signupUrlProp,
	isSectionSignup,
	loginUrl,
	isLostPasswordView,
	signupLinkMobileOnly,
	noThanksRedirectUrl,
	columnWidth,
	showLogo = true,
	subHeadingProminent = false,
	notice,
}: OneLoginLayoutProps ) => {
	const translate = useTranslate();
	const currentRoute = useSelector( getCurrentRoute );
	const { headingText, subHeadingText, subHeadingTextSecondary } = useLoginContext();
	const validatedHeadingText = ensureHeadingProvided( headingText );
	const { topBarLogo } = usePartnerBranding();
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

	const topBar = (): JSX.Element => {
		const signupOrLoginLink = isSectionSignup ? <LoginLink /> : <SignUpLink />;

		// On the main login view, desktop moves the route to signup down to the footer, matching
		// where signup puts its route to login, and leaves this slot empty, also matching signup.
		// Below 960px nothing moves: both screens keep the top-right link they have today.
		//
		// Hidden in CSS rather than by a viewport hook, because this page is server-rendered: a
		// hook has no viewport on the server, so it would render the mobile arrangement and then
		// visibly jump on hydration for every desktop visitor. `display: none`, so the hidden
		// link stays out of the accessibility tree rather than lingering as a second route.
		//
		// Everywhere else (2FA, magic login, the OAuth2 screen) the flag is not passed and this
		// collapses to exactly what it rendered before.
		const rightElement = (
			<nav className="wp-login__one-login-layout-top-right">
				{ signupLinkMobileOnly ? (
					<span className="wp-login__top-right-mobile">{ signupOrLoginLink }</span>
				) : (
					signupOrLoginLink
				) }
				{ noThanksRedirectUrl && <NoThanksLink /> }
			</nav>
		);

		return <Step.TopBar rightElement={ rightElement } logo={ topBarLogo } />;
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
