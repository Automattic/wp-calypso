import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import { Step } from '../../types';

const UserStep: Step = function UserStep( { flow, stepName, navigation } ) {
	const { submit } = navigation;
	const socialService = getSocialServiceFromClientId( '' );

	return (
		<h1>
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
				isReskinned={ true }
				redirectToAfterLoginUrl={ window.location.href }
				queryArgs={ {} }
				userEmail=""
				notice={ false }
				isSocialFirst={ true }
			/>
		</h1>
	);
};

export default UserStep;
