/**
 * External dependencies
 */
var React = require( 'react' ),
	isEmpty = require( 'lodash/isEmpty' ),
	includes = require( 'lodash/includes' ),
	map = require( 'lodash/map' ),
	debug = require( 'debug' )( 'calypso:steps:site' ); // eslint-disable-line no-unused-vars
/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	config = require( 'config' ),
	analytics = require( 'lib/analytics' ),
	formState = require( 'lib/form-state' ),
	SignupActions = require( 'lib/signup/actions' ),
	ValidationFieldset = require( 'signup/validation-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormButton = require( 'components/forms/form-button' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	StepWrapper = require( 'signup/step-wrapper' ),
	LoggedOutForm = require( 'components/logged-out-form' ),
	LoggedOutFormFooter = require( 'components/logged-out-form/footer' );

/**
 * Constants
 */
var VALIDATION_DELAY_AFTER_FIELD_CHANGES = 1500;

/**
 * Module variables
 */
var siteUrlsSearched = [],
	timesValidationFailed = 0;

module.exports = React.createClass( {
	displayName: 'Site',

	getInitialState: function() {
		return {
			form: null,
			submitting: false
		};
	},

	componentWillMount: function() {
		var initialState;

		if ( this.props.step && this.props.step.form ) {
			initialState = this.props.step.form;

			if ( ! isEmpty( this.props.step.errors ) ) {
				initialState = formState.setFieldErrors( formState.setFieldsValidating( initialState ), {
					site: this.props.step.errors[ 0 ].message
				}, true );
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
			initialState: initialState
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	},

	componentWillUnmount: function() {
		this.save();
	},

	sanitizeSubdomain: function( domain ) {
		if ( ! domain ) {
			return domain;
		}
		return domain.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase();
	},

	sanitize: function( fields, onComplete ) {
		var sanitizedSubdomain = this.sanitizeSubdomain( fields.site );
		if ( fields.site !== sanitizedSubdomain ) {
			onComplete( { site: sanitizedSubdomain } );
		}
	},

	validate: function( fields, onComplete ) {
		wpcom.undocumented().sitesNew( {
			blog_name: fields.site,
			blog_title: fields.site,
			validate: true
		}, function( error, response ) {
			var messages = {},
				errorObject = {};

			debug( error, response );

			if ( error && error.message ) {
				if ( fields.site && ! includes( siteUrlsSearched, fields.site ) ) {
					siteUrlsSearched.push( fields.site );

					analytics.tracks.recordEvent( 'calypso_signup_site_url_validation_failed', {
						error: error.error,
						site_url: fields.site
					} );
				}

				timesValidationFailed++;

				errorObject[ error.error ] = error.message;
				messages = { site: errorObject };
			}
			onComplete( null, messages );
		} );
	},

	setFormState: function( state ) {
		this.setState( { form: state } );
	},

	resetAnalyticsData: function() {
		siteUrlsSearched = [];
		timesValidationFailed = 0;
	},

	handleSubmit: function( event ) {
		event.preventDefault();

		this.setState( { submitting: true } );

		this.formStateController.handleSubmit( function( hasErrors ) {
			var site = formState.getFieldValue( this.state.form, 'site' );

			this.setState( { submitting: false } );

			if ( hasErrors ) {
				return;
			}

			analytics.tracks.recordEvent( 'calypso_signup_site_step_submit', {
				unique_site_urls_searched: siteUrlsSearched.length,
				times_validation_failed: timesValidationFailed
			} );

			this.resetAnalyticsData();

			SignupActions.submitSignupStep( {
				processingMessage: this.translate( 'Setting up your site' ),
				stepName: this.props.stepName,
				form: this.state.form,
				site
			} );

			this.props.goToNextStep();
		}.bind( this ) );
	},

	handleBlur: function() {
		this.formStateController.sanitize();
		this.formStateController.validate();
		this.save();
	},

	save: function() {
		SignupActions.saveSignupStep( {
			stepName: 'site',
			form: this.state.form
		} );
	},

	handleChangeEvent: function( event ) {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	handleFormControllerError: function( error ) {
		if ( error ) {
			throw error;
		}
	},

	getErrorMessagesWithLogin: function( fieldName ) {
		var link = config( 'login_url' ) + '?redirect_to=' + window.location.href,
			messages = formState.getFieldErrorMessages( this.state.form, fieldName );

		if ( ! messages ) {
			return;
		}

		return map( messages, function( message, error_code ) {
			if ( error_code === 'blog_name_reserved' ) {
				return (
					<span>
						<p>
							{ message }&nbsp;
							{ this.translate( 'Is this your username? {{a}}Log in now to claim this site address{{/a}}.', {
								components: {
									a: <a href={ link } />
								}
							} ) }
						</p>
					</span>
				);
			}
			return message;
		}.bind( this ) );
	},

	formFields: function() {
		var fieldDisabled = this.state.submitting;

		return <ValidationFieldset errorMessages={ this.getErrorMessagesWithLogin( 'site' ) }>
			<FormLabel htmlFor="site">
				{ this.translate( 'Choose a site address' ) }
			</FormLabel>
			<FormTextInput
				autoFocus={ true }
				autoCapitalize={ 'off' }
				className='site-signup-step__site-url'
				disabled={ fieldDisabled }
				type='text'
				name='site'
				value={ formState.getFieldValue( this.state.form, 'site' ) }
				isError={ formState.isFieldInvalid( this.state.form, 'site' ) }
				isValid={ formState.isFieldValid( this.state.form, 'site' ) }
				onBlur={ this.handleBlur }
				onChange={ this.handleChangeEvent } />
			<span className='site-signup-step__wordpress-domain-suffix'>.wordpress.com</span>
		</ValidationFieldset>;
	},

	buttonText: function() {
		if ( this.props.step && 'completed' === this.props.step.status ) {
			return this.translate( 'Site created - Go to next step' );
		}

		if ( this.state.submitting ) {
			return this.translate( 'Creating your site…' );
		}

		return this.translate( 'Create My Site' );
	},

	formFooter: function() {
		return <FormButton>{ this.buttonText() }</FormButton>;
	},

	renderSiteForm: function() {
		return (
			<LoggedOutForm onSubmit={ this.handleSubmit } noValidate >
				{ this.formFields() }

				<LoggedOutFormFooter>
					{ this.formFooter() }
				</LoggedOutFormFooter>
			</LoggedOutForm>
		);
	},

	render: function() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.translate( 'Create your site.' ) }
				signupProgressStore={ this.props.signupProgressStore }
				stepContent={ this.renderSiteForm() } />
		);
	}
} );
