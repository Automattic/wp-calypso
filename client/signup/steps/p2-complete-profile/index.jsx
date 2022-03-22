import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import EditGravatar from 'calypso/blocks/edit-gravatar';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { saveUserSettings } from 'calypso/state/user-settings/actions';

import './style.scss';

function P2CompleteProfile( {
	flowName,
	stepName,
	positionInFlow,
	submitSignupStep,
	goToNextStep,
} ) {
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ formFullName, setFormFullName ] = useState( '' );
	const [ formErrors, setFormErrors ] = useState( {} );

	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleFormSubmit = ( event ) => {
		event.preventDefault();

		setIsSubmitting( true );

		if ( formFullName.length < 2 ) {
			setFormErrors( {
				fullName: translate( 'Please enter your full name (3 characters or more).' ),
			} );

			setIsSubmitting( false );

			return;
		}

		recordTracksEvent( 'calypso_signup_p2_complete_profile_step_submit' );

		// API call to update user profile.
		dispatch( saveUserSettings( { display_name: formFullName } ) );

		const stepData = {
			stepName: stepName,
			formFullName,
		};

		submitSignupStep( stepData );

		goToNextStep();
	};

	const handleSkipBtnClick = () => {
		submitSignupStep( {
			stepName: stepName,
		} );

		recordTracksEvent( 'calypso_signup_p2_complete_profile_skip_button_click' );

		goToNextStep();
	};

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ translate( 'Complete your profile' ) }
			subHeaderText={ translate(
				'Using a recognizable photo and name will help your team to identify you more easily.'
			) }
		>
			<div className="p2-complete-profile">
				<div className="p2-complete-profile__avatar-wrapper">
					<EditGravatar>
						<button className="p2-complete-profile__upload-avatar-btn">
							{ translate( 'Upload a new avatar' ) }
						</button>
					</EditGravatar>
				</div>

				<div className="p2-complete-profile__form-wrapper">
					<form className="p2-complete-profile__form" onSubmit={ handleFormSubmit } noValidate>
						<label htmlFor="full-name-input" className="p2-complete-profile__form-label form-label">
							{ translate( 'Your Full Name' ) }
						</label>
						<input
							type="text"
							id="full-name-input"
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							name="full-name"
							className="p2-complete-profile__full-name form-text-input"
							disabled={ isSubmitting }
							value={ formFullName }
							onChange={ ( event ) => setFormFullName( event.target.value ) }
						/>
						{ formErrors?.fullName && <FormInputValidation text={ formErrors.fullName } isError /> }
						<div className="p2-complete-profile__form-footer">
							<Button
								type="submit"
								variant="primary"
								className="p2-complete-profile__form-submit-btn"
								disabled={ isSubmitting }
							>
								{ translate( 'Continue' ) }
							</Button>
						</div>
					</form>
				</div>
				<div className="p2-complete-profile__skip-wrapper">
					{ createInterpolateElement(
						__( 'No time? No problem! You can <Button>do this later</Button>.' ),
						{
							Button: (
								<Button
									className="p2-complete-profile__skip-btn"
									variant="link"
									onClick={ handleSkipBtnClick }
								/>
							),
						}
					) }
				</div>
			</div>
		</P2StepWrapper>
	);
}

P2CompleteProfile.propTypes = {
	flowName: PropTypes.string.isRequired,
	stepName: PropTypes.string.isRequired,
	positionInFlow: PropTypes.number.isRequired,
};

export default P2CompleteProfile;
