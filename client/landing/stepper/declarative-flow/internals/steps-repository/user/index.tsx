import { StepContainer } from '@automattic/onboarding';
import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { Step } from '../../types';

import './style.scss';

const StepContent: Step = ( { flow, stepName, navigation } ) => {
	const { submit } = navigation;
	const socialService = getSocialServiceFromClientId( '' );
	const isLoggedIn = useSelector( isUserLoggedIn );

	if ( isLoggedIn ) {
		submit?.();
	}

	return (
		<>
			<FormattedHeader align="center" headerText="Create your account" brandFont />
			<SignupFormSocialFirst
				step={ {} }
				stepName={ stepName }
				flowName={ flow }
				goToNextStep={ () => submit?.() }
				logInUrl={ login( {
					signupUrl: window.location.pathname + window.location.search,
				} ) }
				handleSocialResponse={ () => submit?.() }
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
