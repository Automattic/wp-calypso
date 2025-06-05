import { Step, StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { reloadProxy, requestAllBlogsAccess } from 'wpcom-proxy-request';
import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import FormattedHeader from 'calypso/components/formatted-header';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
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
	const dispatch = useDispatch();
	const { handleSocialResponse, notice, accountCreateResponse } = useHandleSocialResponse( flow );
	const [ wpAccountCreateResponse, setWpAccountCreateResponse ] = useState< AccountCreateReturn >();
	const { socialServiceResponse } = useSocialService();

	useEffect( () => {
		if ( wpAccountCreateResponse && 'bearer_token' in wpAccountCreateResponse ) {
			wpcom.loadToken( wpAccountCreateResponse.bearer_token );
			reloadProxy();
			requestAllBlogsAccess();
			dispatch( fetchCurrentUser() as unknown as AnyAction );
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

	const stepContent = (
		<>
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
				userEmail=""
				notice={ notice }
				isSocialFirst
				onCreateAccountSuccess={ handleCreateAccountSuccess }
				backButtonInFooter={ ! isStepContainerV2 }
				emailLabelText={ isStepContainerV2 ? translate( 'Enter your email' ) : undefined }
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
		const heading = (
			// The locale suggestions are going to be reworked. Don't worry about it now.
			<>
				{ localeSuggestions }
				<Step.Heading text={ translate( 'Create your account' ) } />
			</>
		);

		const topBar = (
			<Step.TopBar
				leftElement={
					navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : undefined
				}
				rightElement={
					<Step.LinkButton href={ loginLink }>{ translate( 'Log in' ) }</Step.LinkButton>
				}
			/>
		);

		return (
			<Step.CenteredColumnLayout
				className="step-container-v2--user"
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
