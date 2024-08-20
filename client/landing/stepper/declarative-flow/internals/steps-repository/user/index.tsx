import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { login } from 'calypso/lib/paths';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';
import { useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { Step } from '../../types';
import { useHandleSocialResponse } from './handle-social-response';
import './style.scss';
import { useSocialService } from './use-social-service';

const StepContent: Step = ( { flow, stepName, navigation } ) => {
	const { submit } = navigation;
	const isLoggedIn = useSelector( isUserLoggedIn );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { handleSocialResponse, notice, accountCreateResponse } = useHandleSocialResponse( flow );
	const { socialServiceResponse } = useSocialService();

	useEffect( () => {
		if ( isLoggedIn ) {
			submit?.();
		} else {
			dispatch( fetchCurrentUser() as unknown as AnyAction );
		}
	}, [ dispatch, isLoggedIn, submit ] );

	const loginLink = login( {
		signupUrl: window.location.pathname + window.location.search,
	} );

	return (
		<>
			<FormattedHeader align="center" headerText={ translate( 'Create your account' ) } brandFont />
			<SignupFormSocialFirst
				stepName={ stepName }
				flowName={ flow }
				goToNextStep={ () => {
					dispatch( fetchCurrentUser() as unknown as AnyAction );
					submit?.();
				} }
				logInUrl={ loginLink }
				handleSocialResponse={ handleSocialResponse }
				socialServiceResponse={ socialServiceResponse }
				redirectToAfterLoginUrl={ window.location.href }
				queryArgs={ {} }
				userEmail=""
				notice={ notice }
				isSocialFirst
			/>
			{ accountCreateResponse && 'bearer_token' in accountCreateResponse && (
				<WpcomLoginForm
					authorization={ 'Bearer ' + accountCreateResponse.bearer_token }
					log={ accountCreateResponse.username }
					redirectTo={ window.location.href }
				/>
			) }
		</>
	);
};

const UserStep: Step = function UserStep( props ) {
	const translate = useTranslate();

	return (
		<StepContainer
			stepName="user"
			isHorizontalLayout={ false }
			isWideLayout={ false }
			isFullLayout
			isLargeSkipLayout={ false }
			hideBack
			stepContent={ <StepContent { ...props } /> }
			recordTracksEvent={ recordTracksEvent }
			customizedActionButtons={
				<Button
					className="step-wrapper__navigation-link forward"
					href={ login( {
						signupUrl: window.location.pathname + window.location.search,
					} ) }
					variant="link"
				>
					<span>{ translate( 'Log in' ) }</span>
				</Button>
			}
		/>
	);
};

export default UserStep;
