/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes, isEmpty, map } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';
import { recordTracksEvent } from 'lib/analytics/tracks';
import formState from 'lib/form-state';
import { login } from 'lib/paths';
import ValidationFieldset from 'signup/validation-fieldset';
import FormLabel from 'components/forms/form-label';
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';
import StepWrapper from 'signup/step-wrapper';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:steps:site' );

/**
 * Constants
 */
const VALIDATION_DELAY_AFTER_FIELD_CHANGES = 1500;

/**
 * Module variables
 */
let siteUrlsSearched = [],
	timesValidationFailed = 0;

class Site extends React.Component {
	static displayName = 'Site';

	state = {
		form: null,
		submitting: false,
	};

	UNSAFE_componentWillMount() {
		let initialState;

		if ( this.props.step && this.props.step.form ) {
			initialState = this.props.step.form;

			if ( ! isEmpty( this.props.step.errors ) ) {
				initialState = formState.setFieldErrors(
					formState.setFieldsValidating( initialState ),
					{
						site: this.props.step.errors[ 0 ].message,
					},
					true
				);
			}
		}

		this.formStateController = new formState.Controller( {
			fieldNames: [ 'site' ],
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
			debounceWait: VALIDATION_DELAY_AFTER_FIELD_CHANGES,
			hideFieldErrorsOnChange: true,
			initialState: initialState,
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	}

	componentWillUnmount() {
		this.save();
	}

	sanitizeSubdomain = ( domain ) => {
		if ( ! domain ) {
			return domain;
		}
		return domain.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase();
	};

	sanitize = ( fields, onComplete ) => {
		const sanitizedSubdomain = this.sanitizeSubdomain( fields.site );
		if ( fields.site !== sanitizedSubdomain ) {
			onComplete( { site: sanitizedSubdomain } );
		}
	};

	validate = ( fields, onComplete ) => {
		wpcom.undocumented().sitesNew(
			{
				blog_name: fields.site,
				blog_title: fields.site,
				validate: true,
			},
			function ( error, response ) {
				let messages = {};

				debug( error, response );

				if ( error && error.message ) {
					if ( fields.site && ! includes( siteUrlsSearched, fields.site ) ) {
						siteUrlsSearched.push( fields.site );

						recordTracksEvent( 'calypso_signup_site_url_validation_failed', {
							error: error.error,
							site_url: fields.site,
						} );
					}

					timesValidationFailed++;

					messages = {
						site: {
							[ error.error ]: error.message,
						},
					};
				}
				onComplete( null, messages );
			}
		);
	};

	setFormState = ( state ) => {
		this.setState( { form: state } );
	};

	resetAnalyticsData = () => {
		siteUrlsSearched = [];
		timesValidationFailed = 0;
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.setState( { submitting: true } );

		this.formStateController.handleSubmit(
			function ( hasErrors ) {
				const site = formState.getFieldValue( this.state.form, 'site' );

				this.setState( { submitting: false } );

				if ( hasErrors ) {
					return;
				}

				recordTracksEvent( 'calypso_signup_site_step_submit', {
					unique_site_urls_searched: siteUrlsSearched.length,
					times_validation_failed: timesValidationFailed,
				} );

				this.resetAnalyticsData();

				this.props.submitSignupStep( {
					stepName: this.props.stepName,
					form: this.state.form,
					site,
				} );

				this.props.goToNextStep();
			}.bind( this )
		);
	};

	handleBlur = () => {
		this.formStateController.sanitize();
		this.formStateController.validate();
		this.save();
	};

	save = () => {
		this.props.saveSignupStep( {
			stepName: 'site',
			form: this.state.form,
		} );
	};

	handleChangeEvent = ( event ) => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	handleFormControllerError = ( error ) => {
		if ( error ) {
			throw error;
		}
	};

	getErrorMessagesWithLogin = ( fieldName ) => {
		const link = login( {
				isNative: config.isEnabled( 'login/native-login-links' ),
				redirectTo: window.location.href,
			} ),
			messages = formState.getFieldErrorMessages( this.state.form, fieldName );

		if ( ! messages ) {
			return;
		}

		return map(
			messages,
			function ( message, error_code ) {
				if ( error_code === 'blog_name_reserved' ) {
					return (
						<span>
							<p>
								{ message }
								&nbsp;
								{ this.props.translate(
									'Is this your username? {{a}}Log in now to claim this site address{{/a}}.',
									{
										components: {
											a: <a href={ link } />,
										},
									}
								) }
							</p>
						</span>
					);
				}
				return message;
			}.bind( this )
		);
	};

	formFields = () => {
		const fieldDisabled = this.state.submitting;

		return (
			<ValidationFieldset errorMessages={ this.getErrorMessagesWithLogin( 'site' ) }>
				<FormLabel htmlFor="site">{ this.props.translate( 'Choose a site address' ) }</FormLabel>
				<FormTextInput
					autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
					autoCapitalize={ 'off' }
					className="site__site-url"
					disabled={ fieldDisabled }
					type="text"
					name="site"
					value={ formState.getFieldValue( this.state.form, 'site' ) }
					isError={ formState.isFieldInvalid( this.state.form, 'site' ) }
					isValid={ formState.isFieldValid( this.state.form, 'site' ) }
					onBlur={ this.handleBlur }
					onChange={ this.handleChangeEvent }
				/>
				<span className="site__wordpress-domain-suffix">.wordpress.com</span>
			</ValidationFieldset>
		);
	};

	buttonText = () => {
		if ( this.props.step && 'completed' === this.props.step.status ) {
			return this.props.translate( 'Site created - Go to next step' );
		}

		if ( this.state.submitting ) {
			return this.props.translate( 'Creating your site…' );
		}

		return this.props.translate( 'Create My Site' );
	};

	formFooter = () => {
		return <FormButton>{ this.buttonText() }</FormButton>;
	};

	renderSiteForm = () => {
		return (
			<LoggedOutForm onSubmit={ this.handleSubmit } noValidate>
				{ this.formFields() }

				<LoggedOutFormFooter>{ this.formFooter() }</LoggedOutFormFooter>
			</LoggedOutForm>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.translate( 'Create your site.' ) }
				stepContent={ this.renderSiteForm() }
			/>
		);
	}
}

export default connect( null, { saveSignupStep, submitSignupStep } )( localize( Site ) );
