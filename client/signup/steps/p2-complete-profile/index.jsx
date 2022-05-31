import { FormInputValidation } from '@automattic/components';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EditGravatar from 'calypso/blocks/edit-gravatar';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import {
	hasUserSettingsRequestFailed,
	isUpdatingUserSettings,
} from 'calypso/state/user-settings/selectors';

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

	const dispatch = useDispatch();

	const updatingUserSettings = useSelector( isUpdatingUserSettings );
	const userSettingsRequestFailed = useSelector( hasUserSettingsRequestFailed );

	useEffect( () => {
		if ( isSubmitting && ! updatingUserSettings ) {
			setIsSubmitting( false );

			if ( ! userSettingsRequestFailed ) {
				recordTracksEvent( 'calypso_signup_p2_complete_profile_step_submit' );

				const stepData = {
					stepName: stepName,
					formFullName,
				};

				submitSignupStep( stepData );

				goToNextStep();
			}
		}
	}, [
		isSubmitting,
		updatingUserSettings,
		userSettingsRequestFailed,
		setIsSubmitting,
		formFullName,
		stepName,
		submitSignupStep,
		goToNextStep,
	] );

	const renderUploadAvatarBtn = () => {
		return (
			<button className="p2-complete-profile__upload-avatar-btn">
				{ __( 'Upload a new avatar' ) }
			</button>
		);
	};

	const handleFormSubmit = ( event ) => {
		event.preventDefault();

		setIsSubmitting( true );

		setFormErrors( {} );

		if ( formFullName.length < 2 ) {
			setFormErrors( {
				fullName: __( 'Please enter your full name (2 characters or more).' ),
			} );

			setIsSubmitting( false );

			return;
		}

		// API call to update user profile.
		dispatch( saveUserSettings( { display_name: formFullName } ) );

		recordTracksEvent( 'calypso_signup_p2_complete_profile_submit' );
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
			headerText={ __( 'Complete your profile' ) }
			subHeaderText={ __(
				'Using a recognizable photo and name will help your team to identify you more easily.'
			) }
			stepIndicator={ sprintf(
				/* translators: %1$d and %2$d are numbers. For example, Step 1 of 3 */
				__( 'Step %1$d of %2$d' ),
				3,
				3
			) }
		>
			<div className="p2-complete-profile">
				<div className="p2-complete-profile__avatar-wrapper">
					<EditGravatar additionalUploadHtml={ renderUploadAvatarBtn() } />
				</div>

				<div className="p2-complete-profile__form-wrapper">
					<form className="p2-complete-profile__form" onSubmit={ handleFormSubmit } noValidate>
						<label htmlFor="full-name-input" className="p2-complete-profile__form-label form-label">
							{ __( 'Your Full Name' ) }
						</label>
						<input
							type="text"
							id="full-name-input"
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
								{ __( 'Continue' ) }
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
