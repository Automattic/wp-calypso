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
import { useExperiment } from 'calypso/lib/explat';
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
import { useSocialService } from './use-social-service';
import type { SignupAllowedService } from 'calypso/components/social-buttons/utils';

import './style.scss';

// Experiment: new mobile layout for the user step. Register in ExPlat with
// `control` and `treatment` variations.
const MOBILE_LAYOUT_EXPERIMENT_NAME = 'calypso_signup_onboarding_user_mobile_layout_202605';
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

	// Users arriving from woocommerce.com's hosting-solutions CTA see the "open email + slider"
	// account-step variant. Everyone else sees the default single-column signup.
	const isWooEmailFirstVariant = queryArgs.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;

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
	const isMobileViewport = useViewportMatch( 'small', '<' );

	// The mobile-layout experiment is only eligible on mobile viewports so desktop
	// users never consume an ExPlat slot. While the assignment is loading we defer
	// both the heading and the form — otherwise the brief flash of control-shape
	// UI before treatment paints would self-bias the social-conversion metric the
	// experiment is measuring.
	const isMobileLayoutExperimentEligible =
		isStepContainerV2 && isMobileViewport && ! isWooEmailFirstVariant;
	const [ isExperimentLoading, experimentAssignment ] = useExperiment(
		MOBILE_LAYOUT_EXPERIMENT_NAME,
		{ isEligible: isMobileLayoutExperimentEligible }
	);
	const isMobileTreatment =
		isMobileLayoutExperimentEligible &&
		! isExperimentLoading &&
		experimentAssignment?.variationName === 'treatment';
	const shouldDeferMobileReveal = isMobileLayoutExperimentEligible && isExperimentLoading;

	const emailLabelText = isStepContainerV2 ? translate( 'Enter your email' ) : undefined;
	const allowedSocialServices = isMobileTreatment
		? MOBILE_SOCIAL_SERVICES
		: partnerConfig?.ssoProviders;

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
					isEmailFirstVariant={ isWooEmailFirstVariant }
					isMobileCompactVariant={ isMobileTreatment }
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
		const heading = shouldDeferMobileReveal ? null : (
			// The locale suggestions are going to be reworked. Don't worry about it now.
			<>
				{ localeSuggestions }
				<Step.Heading
					text={ headingText }
					subText={ headingSubText }
					align={ isWooEmailFirstVariant ? 'left' : undefined }
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
					isWooEmailFirstVariant ? null : (
						<Step.LinkButton href={ loginLink }>{ translate( 'Log in' ) }</Step.LinkButton>
					)
				}
			/>
		);

		if ( isLargeViewport && isWooEmailFirstVariant ) {
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
