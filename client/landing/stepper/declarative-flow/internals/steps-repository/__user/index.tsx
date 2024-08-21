import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { login } from 'calypso/lib/paths';
import { AccountCreateReturn } from 'calypso/lib/signup/api/type';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';
import { useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { Step } from '../../types';
import { useHandleSocialResponse } from './handle-social-response';
import './style.scss';
import { useSocialService } from './use-social-service';

const UserStep: Step = function UserStep( {
	flow,
	stepName,
	navigation,
	_redirectTo = window.location.href,
} ) {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const dispatch = useDispatch();
	const { handleSocialResponse, notice, accountCreateResponse } = useHandleSocialResponse( flow );

	const [ wpAccountCreateResponse, setWpAccountCreateResponse ] = useState< AccountCreateReturn >();
	const { socialService, socialServiceResponse } = useSocialService();
	const response = wpAccountCreateResponse || accountCreateResponse;

	useEffect( () => {
		if ( ! isLoggedIn ) {
			dispatch( fetchCurrentUser() as unknown as AnyAction );
		}
	}, [ dispatch, isLoggedIn, _redirectTo, navigation ] );

	const loginLink = login( {
		signupUrl: window.location.pathname + window.location.search,
	} );

	return (
		<StepContainer
			stepName={ stepName }
			isHorizontalLayout={ false }
			isWideLayout={ false }
			isFullLayout
			isLargeSkipLayout={ false }
			hideBack
			stepContent={
				<>
					<FormattedHeader
						align="center"
						headerText={ translate( 'Create your account' ) }
						brandFont
					/>
					<SignupFormSocialFirst
						stepName={ stepName }
						flowName={ flow }
						goToNextStep={ setWpAccountCreateResponse }
						logInUrl={ loginLink }
						handleSocialResponse={ handleSocialResponse }
						socialService={ socialService }
						socialServiceResponse={ socialServiceResponse }
						isReskinned
						redirectToAfterLoginUrl={ window.location.href }
						queryArgs={ {} }
						userEmail=""
						notice={ notice }
						isSocialFirst
					/>
					{ response && 'bearer_token' in response && (
						<WpcomLoginForm
							authorization={ 'Bearer ' + response.bearer_token }
							log={ response.username }
							redirectTo={ new URL( _redirectTo, window.location.href ).href }
						/>
					) }
				</>
			}
			recordTracksEvent={ recordTracksEvent }
			customizedActionButtons={
				<Button
					className="step-wrapper__navigation-link forward"
					href={ login( {
						signupUrl: new URL( _redirectTo, window.location.href ).href,
						redirectTo: _redirectTo,
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
