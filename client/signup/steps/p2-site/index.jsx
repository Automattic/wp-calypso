import config from '@automattic/calypso-config';
import { FormLabel, Gridicon } from '@automattic/components';
import { getLanguage } from '@automattic/i18n-utils';
import { createRef } from '@wordpress/element';
import { reusableBlock, Icon } from '@wordpress/icons';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { includes, isEmpty, map, deburr, get, debounce } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import formState from 'calypso/lib/form-state';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { logToLogstash } from 'calypso/lib/logstash';
import { login } from 'calypso/lib/paths';
import wpcom from 'calypso/lib/wp';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { getValueFromProgressStore } from 'calypso/signup/utils';
import ValidationFieldset from 'calypso/signup/validation-fieldset';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import './style.scss';

const debug = debugFactory( 'calypso:steps:p2-site' );

/**
 * Constants
 */
const VALIDATION_DELAY_AFTER_FIELD_CHANGES = 1500;
const ERROR_CODE_MISSING_SITE_TITLE = 123; // Random number, we don't need it.
const ERROR_CODE_MISSING_SITE = 321; // Random number, we don't need it.
const ERROR_CODE_TAKEN_SITE = 1337; // Random number, we don't need it.
const ERROR_CODE_FROM_LOCAL_STORAGE = 7331; // Random number, we don't need it.

const SITE_TAKEN_ERROR_CODES = [
	'blog_name_exists',
	'blog_name_reserved',
	'blog_name_reserved_but_may_be_available',
];

const WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS = [ 'p2', 'team', 'work' ];

const EMAIL_TRUCE_CAMPAIGN_REF = 'p2-email-truce';
const EMAIL_TRUCE_CAMPAIGN_ID = 'p2-email-truce';

/**
 * Module variables
 */
let siteUrlsSearched = [];
let timesValidationFailed = 0;

class P2Site extends Component {
	static displayName = 'P2Site';

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
			lastSuggestionSuffixIndex: 0,
			isFetchingDefaultSuggestion: false,
			showCustomSiteAddressInput: false,
		};
	}

	componentWillUnmount() {
		this.save();
	}

	customizeSiteInput = createRef();

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
		logToLogstash( {
			feature: 'calypso_wp_for_teams',
			message: 'P2 signup validation failed',
			extra: {
				'site-address': formState.getFieldValue( this.state.form, 'site' ),
				error,
				'error-message': errorMessage,
			},
		} );
	};

	fetchSuggestion = async () => {
		const nextSuggestionSuffixIndex =
			( this.state.lastSuggestionSuffixIndex + 1 ) % WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS.length;

		this.setState( { lastSuggestionSuffixIndex: nextSuggestionSuffixIndex } );
		const suggestionSuffix = WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS[ nextSuggestionSuffixIndex ];
		const currentTitle = formState.getFieldValue( this.state.form, 'siteTitle' );
		const suggestionQuery = `${ currentTitle }${ suggestionSuffix }`;

		const suggestionObjects = await wpcom.domains().suggestions( {
			quantity: 1,
			query: suggestionQuery,
			only_wordpressdotcom: true,
		} );

		const suggestion = get( suggestionObjects, '0.domain_name', null );

		if ( ! formState.getFieldValue( this.state.form, 'siteTitle' ) ) {
			this.formStateController.handleFieldChange( {
				name: 'site',
				value: '',
			} );
			return;
		}

		if ( suggestion ) {
			const [ subdomain ] = suggestion.split( '.' );
			this.formStateController.handleFieldChange( {
				name: 'site',
				value: subdomain,
			} );
		}
	};

	suggestDefaultSubdomain = async () => {
		this.formStateController.handleFieldChange( {
			name: 'site',
			value: '',
		} );
		if ( this.state.isFetchingDefaultSuggestion ) {
			return;
		}
		try {
			this.setState( { isFetchingDefaultSuggestion: true } );
			await this.fetchSuggestion();
		} finally {
			this.setState( { isFetchingDefaultSuggestion: false } );
		}
	};

	debouncedSuggestDefaultSubdomain = debounce( this.suggestDefaultSubdomain, 600 );

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
			const locale = getLocaleSlug();
			wpcom.req.post(
				'/sites/new',
				{
					blog_name: fields.site,
					blog_title: fields.siteTitle,
					validate: true,
					locale,
					lang_id: getLanguage( locale ).value,
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				},
				( error, response ) => {
					debug( error, response );

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
							if ( SITE_TAKEN_ERROR_CODES.includes( error.error ) ) {
								messages.site = {
									[ ERROR_CODE_TAKEN_SITE ]: this.props.translate(
										'Sorry, that site already exists! Please, try a different one'
									),
								};
							} else {
								messages.site = {
									[ error.error ]: error.message,
								};
							}

							// We want to log the real error code and message. The above is formatted for the end user
							// only.
							this.logValidationErrorToLogstash( error.error, error.message );
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

			const stepData = {
				stepName: this.props.stepName,
				form: this.state.form,
				site,
				siteTitle,
			};

			const refParameter =
				this.props.refParameter ||
				getValueFromProgressStore( {
					signupProgress: this.props.progress,
					stepName: 'p2-confirm-email',
					fieldName: 'storedRefParameter',
				} );
			if ( refParameter === EMAIL_TRUCE_CAMPAIGN_REF ) {
				stepData.campaign = EMAIL_TRUCE_CAMPAIGN_ID;
			}

			this.props.submitSignupStep( stepData );

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

		if ( event.target.name === 'site-title' && ! this.state.showCustomSiteAddressInput ) {
			this.debouncedSuggestDefaultSubdomain();
		}
	};

	handleFormControllerError = ( error ) => {
		if ( error ) {
			throw error;
		}
	};

	getErrorMessagesWithLogin = ( fieldName ) => {
		const link = login( { redirectTo: window.location.href } );
		const messages = formState.getFieldErrorMessages( this.state.form, fieldName );

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

	handleSubdomainSuggestionClick = ( suggestedSubdomain ) => {
		const site = suggestedSubdomain.substring( 0, suggestedSubdomain.indexOf( '.' ) );

		this.formStateController.handleFieldChange( {
			name: 'site',
			value: site,
		} );
	};

	renderDefaultSite = () => {
		const site = formState.getFieldValue( this.state.form, 'site' );
		const handleMouseLeave = ( event ) => {
			event.currentTarget.scrollLeft = 0;
		};
		const { isFetchingDefaultSuggestion } = this.state;

		return (
			<div className="p2-site__wordpress-domain-default-container">
				<span
					className="p2-site__wordpress-domain-default"
					title={ site ? `https://${ site }.wordpress.com` : '' }
				>
					<span onMouseLeave={ handleMouseLeave } className="p2-site__site-wordpress-domain">
						{ site }
					</span>
					<span className="p2-site__site-wordpress-suffix">
						{ site ? '.wordpress.com' : '' }&nbsp;
					</span>
					<button
						type="button"
						disabled={ isFetchingDefaultSuggestion }
						className="p2-site__site-wordpress-domain-refresh"
						onClick={ this.suggestDefaultSubdomain }
					>
						<Icon size={ 24 } icon={ reusableBlock } />
					</button>
				</span>
			</div>
		);
	};

	showCustomSiteAddressInput = () => {
		this.setState( { showCustomSiteAddressInput: true } );
		setTimeout( () => {
			this.customizeSiteInput?.current?.focus();
		}, 0 );
	};

	hideSiteCustomizer = () => {
		this.suggestDefaultSubdomain();
		this.setState( { showCustomSiteAddressInput: false } );
	};

	renderSuggestedSiteAddressInput = () => {
		const { form } = this.state;
		const site = formState.getFieldValue( form, 'site' );

		return (
			<>
				<FormTextInput
					id="site-address-input"
					autoCapitalize="off"
					className="p2-site__site-suggested-url"
					disabled
					name="suggested-site"
					value={ site ? `https://${ site }.wordpress.com` : '' }
				/>
				{ this.renderDefaultSite() }
				<FormSettingExplanation className="p2-site__workspace-form-input-explanation">
					{ this.props.translate(
						'We suggest this URL, but you can {{a}}choose manually{{/a}} too',
						{
							components: {
								a: <a href="#" onClick={ this.showCustomSiteAddressInput } />, // eslint-disable-line jsx-a11y/anchor-is-valid
							},
						}
					) }
				</FormSettingExplanation>
			</>
		);
	};

	renderCustomSiteAddressInput = () => {
		const { submitting, form } = this.state;
		const site = formState.getFieldValue( form, 'site' );
		return (
			<>
				<FormTextInput
					id="site-address-input"
					ref={ this.customizeSiteInput }
					autoCapitalize="off"
					className="p2-site__site-url"
					disabled={ submitting }
					name="site"
					value={ site }
					isError={ formState.isFieldInvalid( form, 'site' ) }
					isValid={ formState.isFieldValid( form, 'site' ) }
					onBlur={ this.handleBlur }
					onChange={ this.handleChangeEvent }
				/>
				<FormSettingExplanation className="p2-site__workspace-form-input-explanation">
					{ this.props.translate( 'Enter an address, or {{a}}choose a suggestion{{/a}}', {
						components: {
							a: <a href="#" onClick={ this.hideSiteCustomizer } />, // eslint-disable-line jsx-a11y/anchor-is-valid
						},
					} ) }
				</FormSettingExplanation>
				<span className="p2-site__wordpress-domain-suffix">.wordpress.com</span>
			</>
		);
	};

	renderSubdomainInput = () => {
		const { showCustomSiteAddressInput } = this.state;
		return (
			<ValidationFieldset
				errorMessages={ this.getErrorMessagesWithLogin( 'site' ) }
				className="p2-site__validation-site"
			>
				<FormLabel htmlFor="site-address-input">
					{ this.props.translate( 'Workspace address' ) }
				</FormLabel>
				<div className="p2-site__site-url-container">
					{ ! showCustomSiteAddressInput && this.renderSuggestedSiteAddressInput() }
					{ showCustomSiteAddressInput && this.renderCustomSiteAddressInput() }
				</div>
			</ValidationFieldset>
		);
	};

	formFields = () => {
		const { submitting, form } = this.state;
		const siteTitle = formState.getFieldValue( form, 'siteTitle' );
		const site = formState.getFieldValue( form, 'site' );
		const showSubdomainInput = !! siteTitle || !! site;

		return (
			<>
				<ValidationFieldset
					errorMessages={ this.getErrorMessagesWithLogin( 'siteTitle' ) }
					className="p2-site__validation-site-title"
				>
					<FormLabel htmlFor="site-title-input">
						{ this.props.translate( 'Workspace name' ) }
					</FormLabel>
					<FormTextInput
						id="site-title-input"
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
						autoCapitalize="off"
						className="p2-site__site-title"
						disabled={ submitting }
						name="site-title"
						value={ siteTitle }
						isError={ formState.isFieldInvalid( form, 'siteTitle' ) }
						isValid={ formState.isFieldValid( form, 'siteTitle' ) }
						onBlur={ this.handleBlur }
						onChange={ this.handleChangeEvent }
					/>
					<FormSettingExplanation className="p2-site__workspace-form-input-explanation">
						{ this.props.translate( 'This is usually the name of your company or organization' ) }
					</FormSettingExplanation>
				</ValidationFieldset>
				{ showSubdomainInput && this.renderSubdomainInput() }
				{ this.renderFormNotice() }
			</>
		);
	};

	buttonText = () => {
		if ( this.props.step && 'completed' === this.props.step.status ) {
			return this.props.translate( 'Site created - Go to next step' );
		}

		return this.props.translate( 'Create workspace' );
	};

	renderFormNotice = () => {
		return (
			<div className="p2-site__workspace-form-notice-wrapper">
				<hr />
				<div className="p2-site__workspace-form-notice">
					<div className="p2-site__workspace-form-notice-icon">
						<Gridicon size={ 24 } icon="info-outline" />
					</div>
					<p>
						{ this.props.translate(
							"The first P2 in your workspace will be created automatically for you, so you can focus on getting started. You'll be able to customize it at any time!"
						) }
					</p>
				</div>
				<hr />
			</div>
		);
	};

	render() {
		const { submitting, form } = this.state;
		const siteTitle = formState.getFieldValue( form, 'siteTitle' );
		const site = formState.getFieldValue( form, 'site' );
		const submitDisabled = submitting || ! site || ! siteTitle;
		return (
			<>
				<P2StepWrapper
					className="p2-site__create"
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.props.translate( 'Create a workspace' ) }
					subHeaderText={ this.props.translate(
						"Your {{b}}workspace{{/b}} is where you'll create all the different P2s for teams, projects, topics, etc.",
						{
							components: {
								b: <b />,
							},
						}
					) }
				>
					<form className="p2-site__form" onSubmit={ this.handleSubmit } noValidate>
						{ this.formFields() }
						<div className="p2-site__form-footer">
							<FormButton disabled={ submitDisabled } className="p2-site__form-submit-btn">
								{ this.buttonText() }
							</FormButton>
						</div>
					</form>

					<div className="p2-site__learn-more">
						<a href="https://wordpress.com/p2/" className="p2-site__learn-more-link">
							{ this.props.translate( 'Learn more about P2' ) }
						</a>
					</div>
				</P2StepWrapper>
			</>
		);
	}
}

export default connect( null, { saveSignupStep, submitSignupStep } )( localize( P2Site ) );
