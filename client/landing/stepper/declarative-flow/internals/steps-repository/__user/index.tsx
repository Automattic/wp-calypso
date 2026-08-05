import config from '@automattic/calypso-config';
import { Step, StepContainer } from '@automattic/onboarding';
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
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import { login } from 'calypso/lib/paths';
import { AccountCreateReturn } from 'calypso/lib/signup/api/type';
import wpcom from 'calypso/lib/wp';
import { setSignupIsNewUser } from 'calypso/signup/storageUtils';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';
import { useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUserId, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { Step as StepType } from '../../types';
import EmailVerificationGate from './email-verification';
import {
	claimGateConfirmation,
	gateScope,
	isFreshSignup,
	markFreshSignup,
} from './email-verification/storage';
import { useHandleSocialResponse } from './handle-social-response';
import { SignupSlider } from './signup-slider';
import useAccountCreationExperiment from './use-account-creation-experiment';
import { useBackoffPoll } from './use-backoff-poll';
import { useEmailVerificationGate } from './use-email-verification-gate';
import { useSocialService } from './use-social-service';
import type { SignupAllowedService } from 'calypso/components/social-buttons/utils';

import './style.scss';

// Social providers shown on the mobile treatment per the design. Also keeps the
// local-dev-only PayPal button off the treatment (the prod build never has that
// flag enabled, but the local-dev one does).
const MOBILE_SOCIAL_SERVICES: SignupAllowedService[] = [ 'google', 'apple', 'github' ];

export type UserStepAccepts = {
	headerText?: string;
	subHeaderText?: string;
	/**
	 * Hides the top-level "Log in" link (V2 top bar / V1 footer). The email-first
	 * account-step variant keeps its own in-form "Have an account? Log in" link.
	 * Existing users can still sign in via the social / email buttons either way.
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
	const userId = useSelector( getCurrentUserId );
	const queryArgs = useQuery();
	const dispatch = useDispatch();
	const { handleSocialResponse, notice, accountCreateResponse } = useHandleSocialResponse( flow );
	const [ wpAccountCreateResponse, setWpAccountCreateResponse ] = useState< AccountCreateReturn >();

	const { isEnabled: gateEnabled, status: gateStatus } = useEmailVerificationGate( flow );
	const gateScopeForUser = gateScope( flow, userId );
	// The account exists and its token is loaded, but `/me` hasn't caught up — so nothing here
	// knows who it is yet, and Redux still reports nobody logged in.
	const isWaitingForCreatedAccount = !! wpAccountCreateResponse && gateStatus === 'pending';
	const { socialServiceResponse } = useSocialService();
	const { topBarLogo, partnerConfig, signupTosElement } = usePartnerBranding();

	// Woo-referrer users keep the permanent email-first + slider treatment from PR #110118.
	// Everyone else is bucketed by calypso_account_step_improvement_202606_v2 (round 2):
	//   - control                            -> default single-column signup
	//   - treatment_email_slider_webp        -> open email + slider, email on top
	//   - treatment_email_bottom_slider_webp -> open email + slider, email below social
	const isWooReferrer = queryArgs.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;
	const { isEmailFirstVariant: isEmailFirstFromExperiment, isEmailAtBottom } =
		useAccountCreationExperiment( { flow } );
	const isEmailFirstVariant = isWooReferrer || isEmailFirstFromExperiment;

	// Load the new account's token and refresh the current user. Depends only on the
	// account-create response, so gate/navigation state changes don't repeat it.
	useEffect( () => {
		if ( ! ( wpAccountCreateResponse && 'bearer_token' in wpAccountCreateResponse ) ) {
			return;
		}
		wpcom.loadToken( wpAccountCreateResponse.bearer_token );
		if ( ! config.isEnabled( 'oauth' ) ) {
			reloadProxy();
			requestAllBlogsAccess();
		}
		// Allow retries of fetching new users after creation. New user sign-ups go to one DC
		// but follow-up API calls go to the closest DC, which may be different and might not
		// have replicated the user data yet.
		dispatch( fetchCurrentUser( { retry: true } ) as unknown as AnyAction );
	}, [ dispatch, wpAccountCreateResponse ] );

	useEffect( () => {
		if ( ! isLoggedIn ) {
			dispatch( fetchCurrentUser() as unknown as AnyAction );
		} else if ( gateStatus === 'pending' ) {
			dispatch( fetchCurrentUser( { retry: true } ) as unknown as AnyAction );
		} else if ( gateStatus !== 'gated' ) {
			// The step owns the whole of finishing; the gate is presentation, and unmounting it is
			// what this transition looks like. Only `/me` saying verified is a confirmation — the
			// flag being off is not — and the claim decides which tab records it. Navigation
			// doesn't wait on that: every tab continues whether or not it was the one counting.
			if ( gateStatus === 'verified' ) {
				claimGateConfirmation( gateScopeForUser ).then( ( claim ) => {
					if ( claim ) {
						recordTracksEvent( 'calypso_signup_email_verification_confirmed', {
							flow,
							seconds_on_step: claim.secondsOnStep,
						} );
					}
				} );
			}
			navigation.submit?.();
		}
	}, [ dispatch, isLoggedIn, navigation, gateStatus, gateScopeForUser, flow ] );

	// A retry batch is finite and swallows its failure, so nothing would ask again. An account just
	// created isn't logged in until `/me` answers — the request that failed — so the tab that made
	// it keeps asking on its own account.
	useBackoffPoll(
		() => dispatch( fetchCurrentUser() as unknown as AnyAction ),
		( isLoggedIn && gateStatus === 'pending' ) || isWaitingForCreatedAccount
	);

	const locale = useFlowLocale();

	const loginLink = login( {
		signupUrl,
		redirectTo,
		locale,
		from: partnerConfig?.id ?? queryArgs.get( 'from' ) ?? undefined,
	} );

	const shouldRenderLocaleSuggestions = ! isLoggedIn; // For logged-in users, we respect the user language settings

	const handleCreateAccountSuccess = ( data: AccountCreateReturn ) => {
		if ( ! ( 'ID' in data ) ) {
			return;
		}
		setSignupIsNewUser( data.ID );
		if ( gateEnabled ) {
			// Records that an email really was just sent. It does not decide whether the gate opens.
			markFreshSignup( gateScope( flow, data.ID ) );
			// The activation email from account creation is the one the gate asks for, so the gate
			// sends nothing on arrival — this only records the send the server just made.
			recordTracksEvent( 'calypso_signup_email_verification_email_sent', {
				flow,
				is_resend: false,
			} );
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

	const emailLabelText = isStepContainerV2 ? translate( 'Enter your email' ) : undefined;
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

	if ( gateStatus === 'gated' ) {
		return (
			<EmailVerificationGate
				// A different account is a different attempt: without this the cooldown, the send
				// state and the poll's ladder would all carry over to whoever `/me` resolved.
				key={ gateScopeForUser }
				flow={ flow }
				scope={ gateScopeForUser }
				isNewSignup={ isFreshSignup( gateScopeForUser ) }
				logo={ topBarLogo }
			/>
		);
	}

	// Nobody with an account has any business being offered another one — including someone whose
	// account exists but whose `/me` hasn't landed, who would otherwise be looking at live social
	// buttons and a "See all options" link moments after signing up.
	if ( isLoggedIn || isWaitingForCreatedAccount ) {
		return <Step.Loading />;
	}

	if ( isStepContainerV2 ) {
		let headingText = headerText ?? translate( 'Create your account' );
		let headingSubText = subHeaderText;
		if ( partnerConfig ) {
			headingText = translate( 'Create an account for %(partner)s', {
				args: { partner: partnerConfig.displayName },
				textOnly: true,
			} );
		} else if ( isMobileCompactLayout ) {
			headingText = translate( 'Welcome to WordPress.com' );
			headingSubText = translate( 'Sign up free to start creating your site.' );
		}
		const heading = (
			// The locale suggestions are going to be reworked. Don't worry about it now.
			<>
				{ localeSuggestions }
				<Step.Heading
					text={ headingText }
					subText={ headingSubText }
					align={ isEmailFirstVariant ? 'left' : undefined }
				/>
			</>
		);

		const topBar = (
			<Step.TopBar
				logo={ topBarLogo }
				leftElement={
					navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : undefined
				}
				rightElement={
					hideLoginLink || isEmailFirstVariant ? null : (
						<Step.LinkButton href={ loginLink }>{ translate( 'Log in' ) }</Step.LinkButton>
					)
				}
			/>
		);

		if ( isLargeViewport && isEmailFirstVariant ) {
			return (
				<Step.TwoColumnLayout
					className="step-container-v2--user"
					firstColumnWidth={ 6 }
					secondColumnWidth={ 6 }
					columns={ 12 }
					noInlinePadding
					isFullWidth
				>
					<Step.CenteredColumnLayout
						verticalAlign="center"
						headingColumnWidth={ 4 }
						columnWidth={ 4 }
						heading={ heading }
						topBar={ topBar }
						noGap
					>
						{ stepContent }
					</Step.CenteredColumnLayout>
					<SignupSlider />
				</Step.TwoColumnLayout>
			);
		}

		return (
			<Step.CenteredColumnLayout
				className={ clsx( 'step-container-v2--user', {
					'step-container-v2--user-mobile': isMobileCompactLayout,
				} ) }
				verticalAlign="center"
				columnWidth={ 4 }
				heading={ heading }
				topBar={ topBar }
			>
				{ stepContent }
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
