/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { inbox } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
/**
 * Internal dependencies
 */
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import {
	getCurrentUserEmail,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import './style.scss';

function P2ConfirmEmail( { flowName, stepName, positionInFlow, submitSignupStep, goToNextStep } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const userEmail = useSelector( getCurrentUserEmail );
	const isUserEmailVerified = useSelector( isCurrentUserEmailVerified );

	const [ isFetchingUser, setIsFetchingUser ] = useState( false );

	const refreshUser = async () => {
		setIsFetchingUser( true );

		await dispatch( fetchCurrentUser() );

		setIsFetchingUser( false );
	};

	const handleNextStepClick = async ( option ) => {
		// TODO Check if we can use client/lib/user/verification-checker.js
		await refreshUser();

		if ( ! isUserEmailVerified ) {
			return;
		}

		submitSignupStep( {
			stepName,
			option,
		} );

		goToNextStep();
	};

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerIcon={ inbox }
			headerText={ translate( 'Check your email' ) }
		>
			<div className="p2-confirm-email">
				<div>
					{ translate(
						"We've sent an email with a verification link to {{strong}}%(email)s{{/strong}}. Please follow that link to confirm your email address and continue.",
						{
							args: { email: userEmail },
							components: { strong: <strong /> },
						}
					) }
				</div>
				<div>
					<Button
						className="p2-confirm-email__change-email"
						disabled={ isFetchingUser }
						onClick={ handleNextStepClick }
					>
						{ translate( 'My email address is confirmed already' ) }
					</Button>
				</div>
			</div>
		</P2StepWrapper>
	);
}

export default P2ConfirmEmail;
