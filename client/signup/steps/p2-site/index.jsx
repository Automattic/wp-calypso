/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes, isEmpty, map, deburr } from 'lodash';
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
import P2StepWrapper from 'signup/p2-step-wrapper';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import { logToLogstash } from 'state/logstash/actions';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:steps:p2-site' );

/**
 * Constants
 */
const VALIDATION_DELAY_AFTER_FIELD_CHANGES = 1500;
const ERROR_CODE_MISSING_SITE_TITLE = 123; // Random number, we don't need it.
const ERROR_CODE_MISSING_SITE = 321; // Random number, we don't need it.

const SITE_TAKEN_ERROR_CODES = [
	'blog_name_exists',
	'blog_name_reserved',
	'blog_name_reserved_but_may_be_available',
	'dotblog_subdomain_not_available',
];

const WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS = [ 'p2', 'team', 'work' ];

/**
 * Module variables
 */
let siteUrlsSearched = [],
	timesValidationFailed = 0;

class P2Site extends React.Component {
	static displayName = 'P2Site';

	constructor( props ) {
		super( props );

		let initialState;

		if ( props?.step?.form ) {
			initialState = props.step.form;

			if ( ! isEmpty( props.step.errors ) ) {
				initialState = formState.setFieldErrors(
					formState.setFieldsValidating( initialState ),
					{
						site: props.step.errors[ 0 ].message,
					},
					true
				);
			}
		}

		this.formStateController = new formState.Controller( {
			fieldNames: [ 'site', 'siteTitle' ],
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
			debounceWait: VALIDATION_DELAY_AFTER_FIELD_CHANGES,
			hideFieldErrorsOnChange: true,
			initialState: initialState,
			skipSanitizeAndValidateOnFieldChange: true,
		} );

		this.state = {
			form: this.formStateController.getInitialState(),
			submitting: false,
			suggestedSubdomains: [],
			lastInvalidSite: '',
		};
	}

	componentWillUnmount() {
		this.save();
	}

	sanitizeSubdomain = ( domain ) => {
		if ( ! domain ) {
			return domain;
		}
		return deburr( domain )
			.replace( /[^a-zA-Z0-9]/g, '' )
			.toLowerCase();
	};

	sanitize = ( fields, onComplete ) => {
		const sanitizedSubdomain = this.sanitizeSubdomain( fields.site );
		if ( fields.site !== sanitizedSubdomain ) {
			onComplete( { site: sanitizedSubdomain, siteTitle: fields.siteTitle } );
		}
	};

	logValidationErrorToLogstash = ( error, errorMessage ) => {
		this.props.logToLogstash( {
			feature: 'calypso_wp_for_teams',
			message: 'P2 signup validation failed',
			extra: {
				'site-address': formState.getFieldValue( this.state.form, 'site' ),
				error,
				'error-message': errorMessage,
			},
		} );
	};

	validate = ( fields, onComplete ) => {
		const messages = {};

		if ( isEmpty( fields.siteTitle ) ) {
			messages.siteTitle = {
				[ ERROR_CODE_MISSING_SITE_TITLE ]: this.props.translate(
					'Please enter your team or project name.'
				),
			};
		}

		if ( isEmpty( fields.site ) ) {
			messages.site = {
				[ ERROR_CODE_MISSING_SITE ]: this.props.translate( 'Please enter your site address.' ),
			};
		}

		if ( ! isEmpty( fields.site ) ) {
			wpcom.undocumented().sitesNew(
				{
					blog_name: fields.site,
					blog_title: fields.siteTitle,
					validate: true,
				},
				( error, response ) => {
					debug( error, response );

					if ( this.state.lastInvalidSite !== fields.site ) {
						this.setState( { suggestedSubdomains: [] } );
					}

					this.setState( { lastInvalidSite: fields.site } );

					if ( error && error.message ) {
						if ( fields.site && ! includes( siteUrlsSearched, fields.site ) ) {
							siteUrlsSearched.push( fields.site );

							recordTracksEvent( 'calypso_signup_wp_for_teams_site_url_validation_failed', {
								error: error.error,
								site_url: fields.site,
							} );
						}

						timesValidationFailed++;

						if ( error.error === 'blog_title_invalid' ) {
							const errorMessage = this.props.translate(
								'Please enter a valid team or project name.'
							);

							messages.siteTitle = {
								[ error.error ]: errorMessage,
							};

							this.logValidationErrorToLogstash( error.error, errorMessage );
						} else {
							messages.site = {
								[ error.error ]: error.message,
							};

							this.logValidationErrorToLogstash( error.error, error.message );
						}

						if ( error.error && SITE_TAKEN_ERROR_CODES.includes( error.error ) ) {
							WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS.forEach( ( suffix ) => {
								const suggestedSubdomain = `${ fields.site }${ suffix }.wordpress.com`;

								wpcom.undocumented().getDomainInfo( suggestedSubdomain, ( apiError ) => {
									if ( apiError && apiError.error && apiError.error === 'unknown_blog' ) {
										this.setState( {
											suggestedSubdomains: [
												...this.state.suggestedSubdomains,
												suggestedSubdomain,
											],
										} );
									}
								} );
							} );
						}
					}

					onComplete( null, messages );
				}
			);
		} else if ( ! isEmpty( messages ) ) {
			if ( messages.siteTitle ) {
				this.logValidationErrorToLogstash(
					ERROR_CODE_MISSING_SITE_TITLE,
					messages.siteTitle[ ERROR_CODE_MISSING_SITE_TITLE ]
				);
			}

			if ( messages.site ) {
				this.logValidationErrorToLogstash(
					ERROR_CODE_MISSING_SITE,
					messages.site[ ERROR_CODE_MISSING_SITE ]
				);
			}

			onComplete( null, messages );
		}
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

		this.formStateController.handleSubmit( ( hasErrors ) => {
			const site = formState.getFieldValue( this.state.form, 'site' );
			const siteTitle = formState.getFieldValue( this.state.form, 'siteTitle' );

			this.setState( { submitting: false } );

			if ( hasErrors ) {
				return;
			}

			recordTracksEvent( 'calypso_signup_wp_for_teams_site_step_submit', {
				unique_site_urls_searched: siteUrlsSearched.length,
				times_validation_failed: timesValidationFailed,
			} );

			this.resetAnalyticsData();

			this.props.submitSignupStep( {
				stepName: this.props.stepName,
				form: this.state.form,
				site,
				siteTitle,
			} );

			this.props.goToNextStep();
		} );
	};

	handleBlur = () => {
		this.formStateController.sanitize();
		this.save();
	};

	save = () => {
		this.props.saveSignupStep( {
			stepName: 'p2-site',
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

		return map( messages, ( message, error_code ) => {
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
		} );
	};

	formFields = () => {
		const fieldDisabled = this.state.submitting;

		return (
			<>
				<ValidationFieldset
					errorMessages={ this.getErrorMessagesWithLogin( 'siteTitle' ) }
					className="p2-site__validation-site-title"
				>
					<FormLabel htmlFor="site-title-input">
						{ this.props.translate( 'Name your team or project' ) }
					</FormLabel>
					<FormTextInput
						id="site-title-input"
						autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
						autoCapitalize={ 'off' }
						className="p2-site__site-title"
						disabled={ fieldDisabled }
						type="text"
						name="site-title"
						value={ formState.getFieldValue( this.state.form, 'siteTitle' ) }
						isError={ formState.isFieldInvalid( this.state.form, 'siteTitle' ) }
						isValid={ formState.isFieldValid( this.state.form, 'siteTitle' ) }
						onBlur={ this.handleBlur }
						onChange={ this.handleChangeEvent }
					/>
				</ValidationFieldset>
				<ValidationFieldset
					errorMessages={ this.getErrorMessagesWithLogin( 'site' ) }
					className="p2-site__validation-site"
				>
					<FormLabel htmlFor="site-address-input">
						{ this.props.translate( 'Choose a site address' ) }
					</FormLabel>
					<FormTextInput
						id="site-address-input"
						autoCapitalize={ 'off' }
						className="p2-site__site-url"
						disabled={ fieldDisabled }
						type="text"
						name="site"
						value={ formState.getFieldValue( this.state.form, 'site' ) }
						isError={ formState.isFieldInvalid( this.state.form, 'site' ) }
						isValid={ formState.isFieldValid( this.state.form, 'site' ) }
						onBlur={ this.handleBlur }
						onChange={ this.handleChangeEvent }
					/>
					<span className="p2-site__wordpress-domain-suffix">.wordpress.com</span>
				</ValidationFieldset>
			</>
		);
	};

	buttonText = () => {
		if ( this.props.step && 'completed' === this.props.step.status ) {
			return this.props.translate( 'Site created - Go to next step' );
		}

		return this.props.translate( 'Continue' );
	};

	render() {
		const { suggestedSubdomains } = this.state;

		return (
			<P2StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ this.props.translate(
					'Share, discuss, review, and collaborate across time zones, without interruptions.'
				) }
			>
				<form className="p2-site__form" onSubmit={ this.handleSubmit } noValidate>
					{ this.formFields() }
					<div className="p2-site__form-footer">
						<FormButton disabled={ this.state.submitting } className="p2-site__form-submit-btn">
							{ this.buttonText() }
						</FormButton>
					</div>
				</form>

				<div className="p2-site__learn-more">
					<a href="https://wordpress.com/p2" className="p2-site__learn-more-link">
						{ this.props.translate( 'Learn more about P2' ) }
					</a>
				</div>

				<div>
					{ map( suggestedSubdomains, ( suggestion, index ) => {
						return <div key={ index }>{ suggestion }</div>;
					} ) }
				</div>
			</P2StepWrapper>
		);
	}
}

export default connect( null, { saveSignupStep, submitSignupStep, logToLogstash } )(
	localize( P2Site )
);
