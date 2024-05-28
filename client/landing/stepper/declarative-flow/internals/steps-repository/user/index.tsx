import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import ContinueAsUser from 'calypso/blocks/login/continue-as-user';
import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import { useSelector } from 'calypso/state';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { Step } from '../../types';

import './style.scss';

const StepContent: Step = ( { flow, stepName, navigation } ) => {
	const { submit } = navigation;
	const socialService = getSocialServiceFromClientId( '' );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isStepSubmittedOnce = useRef( false );

	if ( isLoggedIn ) {
		if ( isStepSubmittedOnce.current ) {
			return (
				<ContinueAsUser
					onContinue={ () => submit?.() }
					onChangeAccount={ () => {
						dispatch( redirectToLogout( window.location.href ) as unknown as AnyAction );
					} }
					isSignUpFlow
					isWooOAuth2Client={ false }
				/>
			);
		}
		isStepSubmittedOnce.current = true;
		submit?.();
	} else {
		isStepSubmittedOnce.current = false;
	}

	return (
		<>
			<FormattedHeader align="center" headerText={ translate( 'Create your account' ) } brandFont />
			<SignupFormSocialFirst
				step={ {} }
				stepName={ stepName }
				flowName={ flow }
				goToNextStep={ () => submit?.() }
				logInUrl={ login( {
					signupUrl: window.location.pathname + window.location.search,
				} ) }
				handleSocialResponse={ () => {
					isStepSubmittedOnce.current = true;
					submit?.();
				} }
				socialService={ socialService ?? '' }
				socialServiceResponse={ {} }
				isReskinned
				redirectToAfterLoginUrl={ window.location.href }
				queryArgs={ {} }
				userEmail=""
				notice={ false }
				isSocialFirst
			/>
		</>
	);
};

const UserStep: Step = function UserStep( props ) {
	return (
		<StepContainer
			stepName="user"
			goBack={ () => {
				window.location.assign( 'https://wordpress.com/hosting' );
			} }
			isHorizontalLayout={ false }
			isWideLayout={ false }
			isFullLayout
			hideFormattedHeader
			isLargeSkipLayout={ false }
			hideBack={ false }
			stepContent={ <StepContent { ...props } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default UserStep;
