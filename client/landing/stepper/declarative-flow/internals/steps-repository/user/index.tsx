import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import { Step } from '../../types';

const UserStep: Step = function UserStep( { navigation } ) {
	const { submit } = navigation;
	const socialService = getSocialServiceFromClientId( '' );

	return (
		<h1>
			<SignupFormSocialFirst
				step="user"
				stepName="user"
				flowName="new-hosted-site"
				goToNextStep={ () => submit?.() }
				logInUrl={ login( {
					signupUrl: window.location.pathname + window.location.search,
				} ) }
				handleSocialResponse={ () => {} }
				socialService={ socialService as string }
				socialServiceResponse=""
				isReskinned={ true }
				redirectToAfterLoginUrl=""
				queryArgs={ {} }
				userEmail=""
				notice={ false }
				isSocialFirst={ true }
			/>
		</h1>
	);
};

export default UserStep;
