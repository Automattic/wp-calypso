/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import '../style.scss';

const LoginStep: Step = function LoginStep( { navigation } ) {
	const { submit, goNext } = navigation;
	const { __ } = useI18n();
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );

	const LoginForm: React.FC = () => {
		const handleSubmit = () => {
			submit?.();
		};

		return (
			<form
				className="login__form"
				onSubmit={ () => {
					handleSubmit?.();
				} }
			>
				<Button className="login__submit-button" type="submit" primary>
					{ __( 'Continue' ) }
				</Button>
			</form>
		);
	};

	/*
	 * If we have a current user and they're logged in,
	 * proceed to the next step; no need to log in.
	 */
	useEffect( () => {
		if ( currentUser && userIsLoggedIn ) {
			goNext?.();
		}
	}, [ currentUser, userIsLoggedIn ] );

	return (
		<StepContainer
			stepName={ 'login-step' }
			hideBack
			hideSkip
			hideNext
			stepContent={ <LoginForm /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LoginStep;
