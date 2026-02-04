import { localizeUrl } from '@automattic/i18n-utils';
import { Step, StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement, useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { reloadProxy, requestAllBlogsAccess } from 'wpcom-proxy-request';
import OneTapAuthLoaderOverlay from 'calypso/blocks/login/one-tap-auth-loader-overlay';
import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import FormattedHeader from 'calypso/components/formatted-header';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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
import { useSocialService } from './use-social-service';

import './style.scss';

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

	const {
		isExperimentVariant,
		isEmailVariation,
		isMessagingVariation,
		isSliderVariation,
		isSimpleSliderVariation,
	} = useAccountCreationExperiment( { flow } );

	useEffect( () => {
		if ( wpAccountCreateResponse && 'bearer_token' in wpAccountCreateResponse ) {
			wpcom.loadToken( wpAccountCreateResponse.bearer_token );
			reloadProxy();
			requestAllBlogsAccess();
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
				emailLabelText={ isStepContainerV2 ? translate( 'Enter your email' ) : undefined }
				isExperimentVariant={ isExperimentVariant }
				isEmailVariation={ isEmailVariation }
				isMessagingVariation={ isMessagingVariation }
				isSliderVariation={ isSliderVariation }
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

	if ( isStepContainerV2 ) {
		const headingText = isMessagingVariation
			? translate( 'Welcome to WordPress.com' )
			: translate( 'Create your account' );
		const heading = (
			// The locale suggestions are going to be reworked. Don't worry about it now.
			<>
				{ localeSuggestions }
				<Step.Heading
					text={ headingText }
					align={ isExperimentVariant ? 'left' : undefined }
					size={ isMessagingVariation ? 'small' : undefined }
				/>
			</>
		);

		const topBar = (
			<Step.TopBar
				leftElement={
					navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : undefined
				}
				rightElement={
					isSliderVariation ? null : (
						<Step.LinkButton href={ loginLink }>{ translate( 'Log in' ) }</Step.LinkButton>
					)
				}
			/>
		);

		let stickyBottomBar = null;
		if ( isMessagingVariation ) {
			const tosText = createInterpolateElement(
				translate(
					'By signing up you agree to our <tosLink>Terms of Service</tosLink> and <privacyLink>Privacy Policy</privacyLink>.'
				),
				{
					tosLink: (
						<a
							href={ localizeUrl( 'https://wordpress.com/tos/' ) }
							onClick={ () => recordTracksEvent( 'calypso_signup_tos_link_click' ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					privacyLink: (
						<a
							href={ localizeUrl( 'https://automattic.com/privacy/' ) }
							onClick={ () => recordTracksEvent( 'calypso_signup_privacy_link_click' ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				}
			);
			const tosParagraph = <p className="signup-form-social-first__tos-link-bottom">{ tosText }</p>;
			stickyBottomBar = () => (
				<Step.StickyBottomBar
					centerElement={ tosParagraph }
					noBoxShadow
					hasTransparentBackground
					centerText
					fullWidth
				/>
			);
		}

		if ( isLargeViewport && isSliderVariation ) {
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
						headingColumnWidth={ isExperimentVariant ? 4 : undefined }
						columnWidth={ 4 }
						heading={ heading }
						topBar={ topBar }
						stickyBottomBar={ stickyBottomBar }
						noGap={ isExperimentVariant }
					>
						{ stepContent }
					</Step.CenteredColumnLayout>
					<SignupSlider hideDescription={ isSimpleSliderVariation } />
				</Step.TwoColumnLayout>
			);
		}

		return (
			<Step.CenteredColumnLayout
				className="step-container-v2--user"
				verticalAlign="center"
				headingColumnWidth={ isExperimentVariant ? 4 : undefined }
				columnWidth={ 4 }
				heading={ heading }
				topBar={ topBar }
				stickyBottomBar={ stickyBottomBar }
				noGap={ isExperimentVariant }
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
