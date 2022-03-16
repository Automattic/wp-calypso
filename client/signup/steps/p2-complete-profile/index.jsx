import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import EditGravatar from 'calypso/blocks/edit-gravatar';
import FormButton from 'calypso/components/forms/form-button';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Timezone from 'calypso/components/timezone';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import formState from 'calypso/lib/form-state';
import guessTimezone from 'calypso/lib/i18n-utils/guess-timezone';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import ValidationFieldset from 'calypso/signup/validation-fieldset';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import './style.scss';

/**
 * Constants
 */
const VALIDATION_DELAY_AFTER_FIELD_CHANGES = 1500;
const ERROR_CODE_FROM_LOCAL_STORAGE = 7331; // Random number, we don't need it.

class P2CompleteProfile extends Component {
	constructor( props ) {
		super( props );

		let initialState;

		if ( props?.step?.form ) {
			initialState = props.step.form;

			if ( ! isEmpty( props.step.errors ) ) {
				const errorMessage = props.step.errors[ 0 ].message;

				this.logValidationErrorToLogstash( ERROR_CODE_FROM_LOCAL_STORAGE, errorMessage );

				initialState = formState.setFieldErrors(
					formState.setFieldsValidating( initialState ),
					{
						site: {
							[ ERROR_CODE_FROM_LOCAL_STORAGE ]: errorMessage,
						},
					},
					true
				);
			}
		} else {
			initialState = {
				fullName: {
					value: '',
				},
				timezone: {
					value: guessTimezone(),
				},
			};
		}

		this.formStateController = new formState.Controller( {
			fieldNames: [ 'fullName', 'timezone' ],
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: ( state ) => {
				this.setState( { form: state } );
			},
			onError: this.handleFormControllerError,
			debounceWait: VALIDATION_DELAY_AFTER_FIELD_CHANGES,
			hideFieldErrorsOnChange: true,
			initialState: initialState,
			skipSanitizeAndValidateOnFieldChange: true,
		} );

		this.state = {
			form: this.formStateController.getInitialState(),
			isSubmitting: false,
			suggestedSubdomains: [],
			lastInvalidSite: '',
		};
	}

	componentWillUnmount() {
		this.save();
	}

	validate = ( fields, onComplete ) => {
		onComplete( null, {} );
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.setState( { isSubmitting: true } );

		this.formStateController.handleSubmit( ( hasErrors ) => {
			const fullName = formState.getFieldValue( this.state.form, 'fullName' );
			const timezone = formState.getFieldValue( this.state.form, 'timezone' );

			if ( hasErrors ) {
				this.setState( { isSubmitting: false } );

				return;
			}

			recordTracksEvent( 'calypso_signup_p2_complete_profile_step_submit' );

			// API calls

			this.props.saveUserSettings( { display_name: fullName } );

			const stepData = {
				stepName: this.props.stepName,
				form: this.state.form,
				fullName,
				timezone,
			};

			this.props.submitSignupStep( stepData );

			this.props.goToNextStep();
		} );
	};

	handleFormControllerError = ( error ) => {
		if ( error ) {
			throw error;
		}
	};

	save = () => {
		this.props.saveSignupStep( {
			stepName: 'p2-complete-profile',
			form: this.state.form,
		} );
	};

	handleBlur = () => {
		this.formStateController.sanitize();
		this.save();
	};

	handleChangeEvent = ( event ) => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	getErrorMessages = ( fieldName ) => {
		const messages = formState.getFieldErrorMessages( this.state.form, fieldName );

		if ( ! messages ) {
			return;
		}

		return messages;
	};

	formFields = () => {
		const fieldDisabled = this.state.isSubmitting;

		return (
			<>
				<ValidationFieldset
					errorMessages={ this.getErrorMessages( 'fullName' ) }
					className="p2-complete-profile__validation-full-name"
				>
					<FormLabel htmlFor="full-name-input">
						{ this.props.translate( 'Your Full Name' ) }
					</FormLabel>
					<FormTextInput
						id="full-name-input"
						autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
						autoCapitalize={ 'off' }
						className="p2-complete-profile__full-name"
						disabled={ fieldDisabled }
						name="full-name"
						value={ formState.getFieldValue( this.state.form, 'fullName' ) }
						isError={ formState.isFieldInvalid( this.state.form, 'fullName' ) }
						isValid={ formState.isFieldValid( this.state.form, 'fullName' ) }
						onBlur={ this.handleBlur }
						onChange={ this.handleChangeEvent }
					/>
				</ValidationFieldset>
				<ValidationFieldset
					errorMessages={ this.getErrorMessages( 'timezone' ) }
					className="p2-complete-profile__validation-timezone"
				>
					<div className="p2-complete-profile__timezone-wrapper">
						<FormLabel htmlFor="timezone-input">{ this.props.translate( 'Time zone' ) }</FormLabel>
						<Timezone
							id="timezone-input"
							name="timezone"
							selectedZone={ formState.getFieldValue( this.state.form, 'timezone' ) }
							onSelect={ ( zone ) =>
								this.handleChangeEvent( { target: { name: 'timezone', value: zone } } )
							}
						/>
					</div>
				</ValidationFieldset>
			</>
		);
	};

	renderUploadAvatarBtn = () => {
		return (
			<button className="p2-complete-profile__upload-avatar-btn">
				{ this.props.translate( 'Upload a new avatar' ) }
			</button>
		);
	};

	render() {
		return (
			<P2StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ this.props.translate( 'Complete your profile' ) }
				subHeaderText={ this.props.translate(
					'Using a recognizable photo and name will help your team to identify you more easily.'
				) }
			>
				<div className="p2-complete-profile">
					<div className="p2-complete-profile__avatar-wrapper">
						<EditGravatar additionalUploadHtml={ this.renderUploadAvatarBtn() } />
					</div>

					<div className="p2-complete-profile__form-wrapper">
						<form className="p2-complete-profile__form" onSubmit={ this.handleSubmit } noValidate>
							{ this.formFields() }
							<div className="p2-complete-profile__form-footer">
								<FormButton
									disabled={ this.state.isSubmitting }
									className="p2-complete-profile__form-submit-btn"
								>
									{ this.props.translate( 'Continue' ) }
								</FormButton>
							</div>
						</form>
					</div>

					<div className="p2-complete-profile__skip-wrapper">
						<span>
							No time? No problem! You can{ ' ' }
							<Button
								className="p2-complete-profile__skip-btn"
								variant="link"
								onClick={ () => {
									submitSignupStep( {
										stepName: this.props.stepName,
									} );

									recordTracksEvent( 'calypso_signup_p2_complete_profile_skip_button_click' );

									this.props.goToNextStep();
								} }
							>
								do this later.
							</Button>
						</span>
					</div>
				</div>
			</P2StepWrapper>
		);
	}
}

export default connect( null, { saveSignupStep, submitSignupStep, saveUserSettings } )(
	localize( P2CompleteProfile )
);
