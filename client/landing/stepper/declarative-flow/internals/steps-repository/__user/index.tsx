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
import SignupFormSocialFirst, {
	MobileCompactTosNotice,
} from 'calypso/blocks/signup-form/signup-form-social-first';
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
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { Step as StepType } from '../../types';
import { useHandleSocialResponse } from './handle-social-response';
import { SignupSlider } from './signup-slider';
import useAccountCreationExperiment from './use-account-creation-experiment';
import useMobileLayoutExperiment from './use-mobile-layout-experiment';
import { useSocialService } from './use-social-service';
import type { SignupAllowedService } from 'calypso/components/social-buttons/utils';

import './style.scss';

// Social providers shown on the mobile treatment per the design. Also keeps the
// local-dev-only PayPal button off the treatment (the prod build never has that
// flag enabled, but the local-dev one does).
const MOBILE_SOCIAL_SERVICES: SignupAllowedService[] = [ 'google', 'apple', 'github' ];

const UserStepComponent: StepType = function UserStep( {
	flow,
	stepName,
	navigation,
	redirectTo = window.location.href,
	signupUrl = window.location.href,
} ) {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const queryArgs = useQuery();
	const dispatch = useDispatch();
	const { handleSocialResponse, notice, accountCreateResponse } = useHandleSocialResponse( flow );
	const [ wpAccountCreateResponse, setWpAccountCreateResponse ] = useState< AccountCreateReturn >();
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

	const loginLink = login( {
		signupUrl,
		redirectTo,
		locale,
		from: partnerConfig?.id ?? queryArgs.get( 'from' ) ?? undefined,
	} );

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

	// While the mobile-layout assignment is loading we defer both the heading and
	// the form — otherwise the brief flash of control-shape UI before treatment
	// paints would self-bias the social-conversion metric this experiment measures.
	const {
		isLoading: isMobileLayoutExperimentLoading,
		isEligible: isMobileLayoutExperimentEligible,
		isMobileTreatment,
		isMobileTreatmentTosTop,
	} = useMobileLayoutExperiment( { flow, isPartnerFlow: !! partnerConfig } );
	const shouldDeferMobileReveal =
		isMobileLayoutExperimentEligible && isMobileLayoutExperimentLoading;

	const emailLabelText = isStepContainerV2 ? translate( 'Enter your email' ) : undefined;
	// Partner branding always wins over the experiment. useMobileLayoutExperiment
	// already excludes partner flows from eligibility (so isMobileTreatment is
	// false whenever partnerConfig is set), making the ! partnerConfig check
	// belt-and-suspenders: it keeps the "partners never get the treatment SSO set"
	// invariant local to this line and safe if eligibility is ever refactored.
	const allowedSocialServices =
		isMobileTreatment && ! partnerConfig ? MOBILE_SOCIAL_SERVICES : partnerConfig?.ssoProviders;
	// customTosElement is reserved for partner branding (legal); the form's
	// mobile-compact branch renders MobileCompactTosNotice as its own fallback
	// when no customTosElement is provided. Routing the notice through
	// customTosElement would double-wrap it in <p>.
	const stepContent = (
		<>
			{ !! queryArgs.get( 'oneTapAuth' ) && ! notice && <OneTapAuthLoaderOverlay /> }
			{ ! shouldDeferMobileReveal && (
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
					isMobileCompactVariant={ isMobileTreatment }
					hideTosElement={ isMobileTreatmentTosTop && ! signupTosElement }
					allowedSocialServices={ allowedSocialServices }
					customTosElement={ signupTosElement }
				/>
			) }
			{ accountCreateResponse && 'bearer_token' in accountCreateResponse && (
				<WpcomLoginForm
					authorization={ 'Bearer ' + accountCreateResponse.bearer_token }
					log={ accountCreateResponse.username }
					redirectTo={ new URL( redirectTo, window.location.href ).href }
				/>
			) }
		</>
	);

	if ( isStepContainerV2 ) {
		let headingText = translate( 'Create your account' );
		let headingSubText;
		if ( partnerConfig ) {
			headingText = translate( 'Create an account for %(partner)s', {
				args: { partner: partnerConfig.displayName },
				textOnly: true,
			} );
		} else if ( isMobileTreatment ) {
			headingText = translate( 'Welcome to WordPress.com' );
			headingSubText = translate( 'Sign up free to start creating your site.' );
		}
		// While the mobile experiment is resolving we render the layout without the
		// heading so neither cohort sees the other variant's copy flash on cold visits.
		// For the top-position arm, the ToS sits as a second <p> after Step.Heading
		// (not inside subText, which Step.Heading wraps in a single <p>). Partner
		// branding suppresses the experiment ToS — partners have their own copy.
		const heading = shouldDeferMobileReveal ? null : (
			// The locale suggestions are going to be reworked. Don't worry about it now.
			<>
				{ localeSuggestions }
				<Step.Heading
					text={ headingText }
					subText={ headingSubText }
					align={ isEmailFirstVariant ? 'left' : undefined }
				/>
				{ isMobileTreatmentTosTop && ! signupTosElement && (
					<MobileCompactTosNotice position="below" />
				) }
			</>
		);

		const topBar = (
			<Step.TopBar
				logo={ topBarLogo }
				leftElement={
					navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : undefined
				}
				rightElement={
					isEmailFirstVariant ? null : (
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
					'step-container-v2--user-mobile-treatment': isMobileTreatment,
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
							headerText={ translate( 'Create your account' ) }
							brandFont
						/>
						{ stepContent }
					</>
				}
				recordTracksEvent={ recordTracksEvent }
				customizedActionButtons={
					<Button
						className="step-wrapper__navigation-link forward"
						href={ loginLink }
						variant="link"
					>
						<span>{ translate( 'Log in' ) }</span>
					</Button>
				}
			/>
		</>
	);
};

export default UserStepComponent;
