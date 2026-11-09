import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { ONBOARDING_FLOW, Step, StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useEffect, useState } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { reloadProxy, requestAllBlogsAccess } from 'wpcom-proxy-request';
import OneTapAuthLoaderOverlay from 'calypso/blocks/login/one-tap-auth-loader-overlay';
import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import FormattedHeader from 'calypso/components/formatted-header';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import {
	THEME_GRID_SIGNUP_LAYOUT,
	WOO_HOSTING_SOLUTIONS_REF,
} from 'calypso/landing/stepper/constants';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import { login } from 'calypso/lib/paths';
import { AccountCreateReturn } from 'calypso/lib/signup/api/type';
import useEntryClarityExperiment from 'calypso/lib/signup/use-entry-clarity-experiment';
import wpcom from 'calypso/lib/wp';
import { setSignupIsNewUser } from 'calypso/signup/storageUtils';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';
import { useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { Step as StepType } from '../../types';
import { useHandleSocialResponse } from './handle-social-response';
import { SignupBrandPanel } from './signup-brand-panel';
import { SignupSlider } from './signup-slider';
import { SignupThemeGrid } from './signup-theme-grid';
import useBrandedAccountLayout from './use-branded-account-layout';
import { useSocialService } from './use-social-service';
import type { SignupAllowedService } from 'calypso/components/social-buttons/utils';

import 'calypso/components/account-template/style.scss';
import './style.scss';

// Social providers shown on the mobile treatment per the design. Also keeps the
// local-dev-only PayPal button off the treatment (the prod build never has that
// flag enabled, but the local-dev one does).
const MOBILE_SOCIAL_SERVICES: SignupAllowedService[] = [ 'google', 'apple', 'github' ];

export type UserStepAccepts = {
	headerText?: string;
	subHeaderText?: string;
	/**
	 * Drops the step's own "Log in" link, wherever the layout puts it. The email-first
	 * account-step variant keeps its in-form link regardless.
	 */
	hideLoginLink?: boolean;
	allowedSocialServices?: SignupAllowedService[];
};

const UserStepComponent: StepType< { accepts: UserStepAccepts } > = function UserStep( {
	flow,
	stepName,
	navigation,
	redirectTo = window.location.href,
	signupUrl = window.location.href,
	headerText,
	subHeaderText,
	hideLoginLink,
	allowedSocialServices: allowedSocialServicesProp,
} ) {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const queryArgs = useQuery();
	const dispatch = useDispatch();
	const { handleSocialResponse, notice, accountCreateResponse } = useHandleSocialResponse( flow );
	const [ wpAccountCreateResponse, setWpAccountCreateResponse ] = useState< AccountCreateReturn >();
	const { socialServiceResponse } = useSocialService();
	const { hasCustomBranding, topBarLogo, partnerConfig, signupTosElement } = usePartnerBranding();

	// Woo-referrer users keep the permanent email-first + slider treatment from PR #110118, and the
	// theme grid layout is email-first with the grid instead of the slider, email below social.
	// Everyone else at 600 px and up gets the branded form, with the brand panel from 960 px, unless
	// a partner's branding applies.
	const isWooReferrer = queryArgs.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;
	const isThemeGridLayout = queryArgs.get( 'signup_layout' ) === THEME_GRID_SIGNUP_LAYOUT;
	const isBrandedLayout = useBrandedAccountLayout( flow ) && ! hasCustomBranding;
	const isEmailFirstVariant = isWooReferrer || isThemeGridLayout || isBrandedLayout;
	const isEmailAtBottom = isThemeGridLayout || isBrandedLayout;
	// The experiment runs on onboarding only. Woo referrers, the theme grid and the branded layout
	// are left out: their email-first layout already has the in-form link and no email button, so
	// the treatment would not change it.
	const isEntryClarityTreatment = useEntryClarityExperiment(
		flow === ONBOARDING_FLOW && ! isWooReferrer && ! isThemeGridLayout && ! isBrandedLayout
	);

	useEffect( () => {
		if ( wpAccountCreateResponse && 'bearer_token' in wpAccountCreateResponse ) {
			wpcom.loadToken( wpAccountCreateResponse.bearer_token );
			if ( ! config.isEnabled( 'oauth' ) ) {
				reloadProxy();
				requestAllBlogsAccess();
			}
			// Allow retries of fetching new users after creation. New user sign-ups go to one DC
			// but follow-up API calls go to the closest DC, which may be different and might not
			// have replicated the user data yet.
			dispatch( fetchCurrentUser( { retry: true } ) as unknown as AnyAction );
		}
		if ( ! isLoggedIn ) {
			dispatch( fetchCurrentUser() as unknown as AnyAction );
		} else {
			navigation.submit?.();
		}
	}, [ dispatch, isLoggedIn, navigation, wpAccountCreateResponse ] );

	const locale = useFlowLocale();
	const shouldLinkLogo = flow === ONBOARDING_FLOW && ! hasCustomBranding;

	const loginLink = login( {
		signupUrl,
		redirectTo,
		locale,
		from: partnerConfig?.id ?? queryArgs.get( 'from' ) ?? undefined,
	} );

	// `origin` says which placement was clicked; `flow` tells V1 and V2 apart.
	const recordLoginLinkClick = ( origin: 'top-bar' | 'form' ) =>
		recordTracksEvent( 'calypso_signup_login_link_click', { flow, step: stepName, origin } );

	const shouldRenderLocaleSuggestions = ! isLoggedIn; // For logged-in users, we respect the user language settings

	const handleCreateAccountSuccess = ( data: AccountCreateReturn ) => {
		if ( 'ID' in data ) {
			setSignupIsNewUser( data.ID );
		}
	};

	const localeSuggestions = shouldRenderLocaleSuggestions && (
		<LocaleSuggestions
			path={ window.location.pathname + window.location.search }
			locale={ locale }
		/>
	);

	const isStepContainerV2 = shouldUseStepContainerV2( flow );
	const isLargeViewport = useViewportMatch( 'large' );
	const isMobileViewport = useViewportMatch( 'small', '<' );

	// Thumb-friendly compact layout for mobile signup. Woo referrers keep their
	// permanent email-first treatment and partner-branded flows keep their own
	// SSO providers, ToS, and heading copy — both are excluded so the compact
	// layout never overrides them.
	const isMobileCompactLayout =
		isStepContainerV2 && isMobileViewport && ! isWooReferrer && ! partnerConfig;

	const showsInFormLoginLink = isEntryClarityTreatment && ! hideLoginLink;

	let emailLabelText;
	if ( isStepContainerV2 ) {
		emailLabelText = isBrandedLayout
			? translate( 'Email address' )
			: translate( 'Enter your email' );
	}
	// Partner branding always wins: isMobileCompactLayout is already false whenever
	// partnerConfig is set, so the ! partnerConfig check here is belt-and-suspenders
	// — it keeps the "partners never get the compact SSO set" invariant local to
	// this line and safe if the eligibility above is ever refactored.
	const allowedSocialServices =
		allowedSocialServicesProp ??
		( isMobileCompactLayout && ! partnerConfig
			? MOBILE_SOCIAL_SERVICES
			: partnerConfig?.ssoProviders );
	// customTosElement is reserved for partner branding (legal); the form's
	// mobile-compact branch renders MobileCompactTosNotice as its own fallback
	// when no customTosElement is provided. Routing the notice through
	// customTosElement would double-wrap it in <p>.
	const stepContent = (
		<>
			{ !! queryArgs.get( 'oneTapAuth' ) && ! notice && <OneTapAuthLoaderOverlay /> }
			<SignupFormSocialFirst
				stepName={ stepName }
				flowName={ flow }
				goToNextStep={ setWpAccountCreateResponse }
				passDataToNextStep
				logInUrl={ loginLink }
				onLogInClick={ () => recordLoginLinkClick( 'form' ) }
				handleSocialResponse={ handleSocialResponse }
				socialServiceResponse={ socialServiceResponse }
				redirectToAfterLoginUrl={ window.location.href }
				queryArgs={ {} }
				userEmail={ queryArgs.get( 'user_email' ) || '' }
				notice={ notice }
				isSocialFirst
				onCreateAccountSuccess={ handleCreateAccountSuccess }
				backButtonInFooter={ ! isStepContainerV2 }
				emailLabelText={ emailLabelText }
				isEmailFirstVariant={ isEmailFirstVariant }
				isEmailAtBottom={ isEmailAtBottom }
				isMobileCompactVariant={ isMobileCompactLayout }
				showLoginLink={ showsInFormLoginLink }
				showEnvelopeIcon={ isEntryClarityTreatment }
				allowedSocialServices={ allowedSocialServices }
				customTosElement={ signupTosElement }
			/>
			{ accountCreateResponse && 'bearer_token' in accountCreateResponse && (
				<WpcomLoginForm
					authorization={ 'Bearer ' + accountCreateResponse.bearer_token }
					log={ accountCreateResponse.username }
					redirectTo={ new URL( redirectTo, window.location.href ).href }
				/>
			) }
		</>
	);

	// A logged-in user is submitted straight past this step, so there's no form to offer them.
	if ( isLoggedIn ) {
		return <Step.Loading />;
	}

	if ( isStepContainerV2 ) {
		let headingText =
			headerText ??
			( isThemeGridLayout
				? translate( 'Create an account to get started' )
				: translate( 'Create your account' ) );
		let headingSubText = subHeaderText;
		if ( partnerConfig ) {
			headingText = translate( 'Create an account for %(partner)s', {
				args: { partner: partnerConfig.displayName },
				textOnly: true,
			} );
		} else if ( isMobileCompactLayout && ! isThemeGridLayout ) {
			// The theme grid layout keeps its own heading at every width.
			headingText = translate( 'Welcome to WordPress.com' );
			headingSubText = translate( 'Sign up free to start creating your site.' );
		}
		const heading = (
			// The locale suggestions are going to be reworked. Don't worry about it now.
			<>
				{ localeSuggestions }
				<Step.Heading text={ headingText } subText={ headingSubText } />
			</>
		);

		const topBar = (
			<Step.TopBar
				logo={ topBarLogo }
				logoHref={ shouldLinkLogo ? localizeUrl( 'https://wordpress.com/', locale ) : undefined }
				onLogoClick={
					shouldLinkLogo
						? () => recordTracksEvent( 'calypso_signup_logo_click', { flow, step: stepName } )
						: undefined
				}
				rightElement={
					// Email-first forms carry their own login link, except the compact one.
					hideLoginLink ||
					( isEmailFirstVariant && ! isMobileCompactLayout ) ||
					showsInFormLoginLink ? null : (
						<nav className="account-template__top-bar-links">
							<Step.LinkButton
								href={ loginLink }
								onClick={ () => recordLoginLinkClick( 'top-bar' ) }
							>
								{ translate( 'Log in' ) }
							</Step.LinkButton>
						</nav>
					)
				}
			/>
		);

		if ( isLargeViewport && isEmailFirstVariant ) {
			const formColumn = isBrandedLayout ? (
				<Step.CenteredColumnLayout verticalAlign="center" columnWidth={ 4 } topBar={ topBar }>
					<div className="account-template">
						{ heading }
						{ stepContent }
					</div>
				</Step.CenteredColumnLayout>
			) : (
				<Step.CenteredColumnLayout
					verticalAlign="center"
					headingColumnWidth={ 4 }
					columnWidth={ 4 }
					heading={ <div className="account-template">{ heading }</div> }
					topBar={ topBar }
					noGap
				>
					{ stepContent }
				</Step.CenteredColumnLayout>
			);

			return (
				<Step.TwoColumnLayout
					className={ clsx( 'step-container-v2--user', {
						'step-container-v2--user-branded': isBrandedLayout,
					} ) }
					firstColumnWidth={ 6 }
					secondColumnWidth={ 6 }
					columns={ 12 }
					noInlinePadding
					isFullWidth
				>
					{ /* The theme grid leads with the pitch, so it takes the first column. */ }
					{ isThemeGridLayout ? (
						<>
							<SignupThemeGrid />
							{ formColumn }
						</>
					) : (
						<>
							{ formColumn }
							{ isBrandedLayout ? <SignupBrandPanel /> : <SignupSlider /> }
						</>
					) }
				</Step.TwoColumnLayout>
			);
		}

		return (
			<Step.CenteredColumnLayout
				className={ clsx( 'step-container-v2--user', {
					'step-container-v2--user-branded': isBrandedLayout,
					'step-container-v2--user-mobile': isMobileCompactLayout,
					'step-container-v2--user-entry-clarity': isEntryClarityTreatment,
				} ) }
				verticalAlign="center"
				columnWidth={ 4 }
				topBar={ topBar }
			>
				<div className="account-template">
					{ isThemeGridLayout && <SignupThemeGrid isCompact /> }
					{ heading }
					{ stepContent }
				</div>
			</Step.CenteredColumnLayout>
		);
	}

	return (
		<>
			{ localeSuggestions }
			<StepContainer
				stepName={ stepName }
				isHorizontalLayout={ false }
				isWideLayout={ false }
				isFullLayout
				isLargeSkipLayout={ false }
				hideBack={ ! navigation.goBack }
				goBack={ navigation.goBack }
				stepContent={
					<>
						<FormattedHeader
							align="center"
							headerText={ headerText ?? translate( 'Create your account' ) }
							subHeaderText={ subHeaderText }
							brandFont
						/>
						{ stepContent }
					</>
				}
				recordTracksEvent={ recordTracksEvent }
				customizedActionButtons={
					hideLoginLink ? undefined : (
						<Button
							className="step-wrapper__navigation-link forward"
							href={ loginLink }
							onClick={ () => recordLoginLinkClick( 'top-bar' ) }
							variant="link"
						>
							<span>{ translate( 'Log in' ) }</span>
						</Button>
					)
				}
			/>
		</>
	);
};

export default UserStepComponent;
