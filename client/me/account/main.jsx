import config from '@automattic/calypso-config';
import { Button, Card, Dialog, FormInputValidation, FormLabel } from '@automattic/components';
import { canBeTranslated, getLanguage, isLocaleVariant } from '@automattic/i18n-utils';
import languages from '@automattic/languages';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { debounce, flowRight as compose, get, map, size } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import LanguagePicker from 'calypso/components/language-picker';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { withGeoLocation } from 'calypso/data/geo/with-geolocation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { onboardingUrl } from 'calypso/lib/paths';
import { protectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import { clearStore } from 'calypso/lib/user/store';
import wpcom from 'calypso/lib/wp';
import AccountEmailField from 'calypso/me/account/account-email-field';
import ReauthRequired from 'calypso/me/reauth-required';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getCurrentUserDate,
	getCurrentUserDisplayName,
	getCurrentUserName,
	getCurrentUserVisibleSiteCount,
} from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import canDisplayCommunityTranslator from 'calypso/state/selectors/can-display-community-translator';
import getUnsavedUserSettings from 'calypso/state/selectors/get-unsaved-user-settings';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import isRequestingMissingSites from 'calypso/state/selectors/is-requesting-missing-sites';
import {
	clearUnsavedUserSettings,
	removeUnsavedUserSetting,
	setUserSetting,
} from 'calypso/state/user-settings/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { saveUnsavedUserSettings } from 'calypso/state/user-settings/thunks';
import AccountSettingsCloseLink from './close-link';
import ToggleLandingPageSettings from './toggle-landing-page';
import ToggleUseCommunityTranslator from './toggle-use-community-translator';

import './style.scss';

export const noticeId = 'me-settings-notice';
const noticeOptions = {
	id: noticeId,
};

/**
 * Debug instance
 */
const debug = debugFactory( 'calypso:me:account' );

const ALLOWED_USERNAME_CHARACTERS_REGEX = /^[a-z0-9]+$/;
const USERNAME_MIN_LENGTH = 4;
const ACCOUNT_FORM_NAME = 'account';
const INTERFACE_FORM_NAME = 'interface';
const ACCOUNT_FIELDS = [ 'user_login', 'user_email', 'user_URL', 'primary_site_ID' ];
const INTERFACE_FIELDS = [
	'locale_variant',
	'language',
	'i18n_empathy_mode',
	'use_fallback_for_incomplete_languages',
	'enable_translator',
	'calypso_preferences',
];

class Account extends Component {
	constructor( props ) {
		super( props );

		this.props.removeUnsavedUserSetting( 'user_login' );
	}

	state = {
		redirect: false,
		showConfirmUsernameForm: false,
		submittingForm: false,
		formsSubmitting: {},
		usernameAction: 'new',
		validationResult: false,
	};

	componentDidUpdate() {
		if ( ! this.hasUnsavedUserSettings( ACCOUNT_FIELDS.concat( INTERFACE_FIELDS ) ) ) {
			this.props.markSaved();
		}
	}

	componentDidMount() {
		const params = new URLSearchParams( window.location.search );
		if ( params.get( 'usernameChangeSuccess' ) === 'true' ) {
			this.props.successNotice( this.props.translate( 'Username changed successfully!' ), {
				duration: 5000,
			} );

			const currentUrl = new URL( window.location.href );
			currentUrl.searchParams.delete( 'usernameChangeSuccess' );
			window.history.replaceState( {}, '', currentUrl.toString() );
		}
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' component is unmounting.' );

		// Silently clean up unsavedSettings before unmounting
		this.props.clearUnsavedUserSettings();
	}

	getDisabledState( formName ) {
		return formName ? this.state.formsSubmitting[ formName ] : this.state.submittingForm;
	}

	getUserSetting( settingName ) {
		return (
			get( this.props.unsavedUserSettings, settingName ) ??
			this.getUserOriginalSetting( settingName )
		);
	}

	getUserOriginalSetting( settingName ) {
		return get( this.props.userSettings, settingName );
	}

	hasUnsavedUserSetting( settingName ) {
		return this.props.unsavedUserSettings.hasOwnProperty( settingName );
	}

	hasUnsavedUserSettings( settingNames ) {
		return settingNames.reduce(
			( acc, settingName ) => this.hasUnsavedUserSetting( settingName ) || acc,
			false
		);
	}

	updateUserSetting( settingName, value ) {
		this.props.setUserSetting( settingName, value );
	}

	updateUserSettingInput = ( event ) => {
		this.updateUserSetting( event.target.name, event.target.value );
	};

	updateUserSettingCheckbox = ( event ) => {
		this.updateUserSetting( event.target.name, event.target.checked );
	};

	updateCommunityTranslatorSetting = ( event ) => {
		const { name, checked } = event.target;
		this.updateUserSetting( name, checked );
		const redirect = '/me/account';
		this.setState( { redirect } );
		this.saveInterfaceSettings( event );
	};

	updateLanguage = ( event ) => {
		const { value, empathyMode, useFallbackForIncompleteLanguages } = event.target;
		this.updateUserSetting( 'language', value );

		if ( typeof empathyMode !== 'undefined' ) {
			this.updateUserSetting( 'i18n_empathy_mode', empathyMode );
		}

		if ( typeof useFallbackForIncompleteLanguages !== 'undefined' ) {
			this.updateUserSetting(
				'use_fallback_for_incomplete_languages',
				useFallbackForIncompleteLanguages
			);
		}

		const localeVariantSelected = isLocaleVariant( value ) ? value : '';

		const originalSlug =
			this.getUserSetting( 'locale_variant' ) || this.getUserSetting( 'language' ) || '';

		const languageHasChanged = originalSlug !== value;
		const formHasChanged = languageHasChanged;
		if ( formHasChanged ) {
			this.props.markChanged();
		}

		const redirect = formHasChanged ? '/me/account' : false;
		// store any selected locale variant so we can test it against those with no GP translation sets
		this.setState( { redirect, localeVariantSelected } );

		if ( formHasChanged ) {
			this.props.recordTracksEvent( 'calypso_user_language_switch', {
				new_language: value,
				previous_language:
					this.getUserOriginalSetting( 'locale_variant' ) ||
					this.getUserOriginalSetting( 'language' ),
				country_code: this.props.geo?.country_short,
			} );
			this.saveInterfaceSettings( event );
		}
	};

	updateUserLoginConfirm = ( event ) => {
		this.setState( { userLoginConfirm: event.target.value } );
	};

	validateUsername = debounce( async () => {
		const { currentUserName, translate } = this.props;
		const username = this.getUserSetting( 'user_login' );

		debug( 'Validating username ' + username );

		if ( username === currentUserName ) {
			this.setState( { validationResult: false } );
			return;
		}

		if ( username.length < USERNAME_MIN_LENGTH ) {
			this.setState( {
				validationResult: {
					error: 'invalid_input',
					message: translate( 'Usernames must be at least 4 characters.' ),
				},
			} );
			return;
		}

		if ( ! ALLOWED_USERNAME_CHARACTERS_REGEX.test( username ) ) {
			this.setState( {
				validationResult: {
					error: 'invalid_input',
					message: translate( 'Usernames can only contain lowercase letters (a-z) and numbers.' ),
				},
			} );
			return;
		}

		try {
			const { success, allowed_actions } = await wpcom.req.get(
				`/me/username/validate/${ username }`
			);

			this.setState( {
				validationResult: { success, allowed_actions, validatedUsername: username },
			} );
		} catch ( error ) {
			this.setState( { validationResult: error } );
		}
	}, 600 );

	hasEmailValidationError() {
		return !! this.state.emailValidationError;
	}

	shouldDisplayCommunityTranslator() {
		const locale = this.getUserSetting( 'language' );

		// disable for locales
		if ( ! locale || ! canBeTranslated( locale ) ) {
			return false;
		}

		// disable for locale variants with no official GP translation sets
		if (
			this.state.localeVariantSelected &&
			! canBeTranslated( this.state.localeVariantSelected )
		) {
			return false;
		}

		// if the user hasn't yet selected a language, and the locale variants has no official GP translation set
		if (
			typeof this.state.localeVariantSelected !== 'string' &&
			! canBeTranslated( this.getUserSetting( 'locale_variant' ) )
		) {
			return false;
		}

		return true;
	}

	thankTranslationContributors() {
		if ( ! this.shouldDisplayCommunityTranslator() ) {
			return;
		}

		const locale = this.getUserSetting( 'language' );
		const language = getLanguage( locale );
		if ( ! language ) {
			return;
		}
		const { translate } = this.props;
		const url = 'https://translate.wordpress.com/translators/?contributor_locale=' + locale;

		return (
			<FormSettingExplanation>
				{ ' ' }
				{ translate(
					'Thanks to {{a}}all our community members who helped translate to {{language/}}{{/a}}!',
					{
						components: {
							a: <a target="_blank" rel="noopener noreferrer" href={ url } />,
							language: <span>{ language.name }</span>,
						},
					}
				) }
			</FormSettingExplanation>
		);
	}

	handleRadioChange = ( event ) => {
		const { name, value } = event.currentTarget;
		this.setState( { [ name ]: value } );
	};

	/**
	 * We handle the username (user_login) change manually through an onChange handler
	 * so that we can also run a debounced validation on the username.
	 * @param {Object} event Event from onChange of user_login input
	 */
	handleUsernameChange = ( event ) => {
		const value = event.currentTarget.value;

		if ( value === this.getUserOriginalSetting( 'user_login' ) ) {
			this.cancelUsernameChange();
			return;
		}

		this.validateUsername();
		this.updateUserSetting( 'user_login', value );
		this.setState( { usernameAction: null } );
	};

	recordClickEvent = ( action ) => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	getClickHandler( action, callback ) {
		return () => {
			this.recordClickEvent( action );

			if ( callback ) {
				callback();
			}
		};
	}

	getFocusHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	}

	handleUsernameChangeBlogRadio = ( event ) => {
		this.props.recordGoogleEvent(
			'Me',
			'Clicked Username Change Blog Action radio',
			'checked',
			event.target.value
		);
	};

	cancelUsernameChange = () => {
		this.setState( {
			userLoginConfirm: null,
			usernameAction: null,
		} );

		this.clearUsernameValidation();
		this.props.removeUnsavedUserSetting( 'user_login' );

		const { user_login, ...otherUnsavedSettings } = this.props.unsavedUserSettings;

		if ( ! Object.keys( otherUnsavedSettings ).length ) {
			this.props.markSaved();
		}
	};

	toggleConfirmUsernameForm = () => {
		this.setState( { showConfirmUsernameForm: ! this.state.showConfirmUsernameForm } );
	};

	submitUsernameForm = async () => {
		const username = this.getUserSetting( 'user_login' );
		const action = this.state.usernameAction ? this.state.usernameAction : 'none';

		this.setState( { submittingForm: true, showConfirmUsernameForm: false } );

		try {
			await wpcom.req.post( '/me/username', { username, action } );
			this.setState( { submittingForm: false } );

			this.props.markSaved();

			// We reload here to refresh cookies, user object, and user settings.
			// @TODO: Do not require reload here.
			const currentUrl = new URL( window.location.href );
			currentUrl.searchParams.set( 'usernameChangeSuccess', 'true' );
			window.location.href = currentUrl.toString();
		} catch ( error ) {
			this.setState( { submittingForm: false, validationResult: error } );
			this.props.errorNotice( error.message );
		}
	};

	isUsernameValid() {
		return this.state.validationResult?.success === true;
	}

	getUsernameValidationFailureMessage() {
		return this.state.validationResult?.message ?? null;
	}

	getAllowedActions() {
		return this.state.validationResult?.allowed_actions ?? {};
	}

	getValidatedUsername() {
		return this.state.validationResult?.validatedUsername ?? null;
	}

	clearUsernameValidation() {
		this.setState( { validationResult: false } );
	}

	onSiteSelect = ( siteId ) => {
		if ( siteId ) {
			this.updateUserSetting( 'primary_site_ID', siteId );
		}
	};

	renderJoinDate() {
		const { currentUserDate, translate, moment } = this.props;
		const dateMoment = moment( currentUserDate );

		return (
			<span>
				{ translate( 'Joined %(month)s %(year)s', {
					args: {
						month: dateMoment.format( 'MMMM' ),
						year: dateMoment.format( 'YYYY' ),
					},
				} ) }
			</span>
		);
	}

	renderUsernameValidation() {
		const { translate } = this.props;
		const isUsernameValid = this.isUsernameValid();
		const usernameValidationFailureMessage = this.getUsernameValidationFailureMessage();

		if ( ! this.hasUnsavedUserSetting( 'user_login' ) ) {
			return null;
		}

		if ( ! isUsernameValid && null === usernameValidationFailureMessage ) {
			return null;
		}

		return (
			<FormInputValidation isError={ ! isUsernameValid }>
				{ isUsernameValid ? translate( 'Nice username!' ) : usernameValidationFailureMessage }
			</FormInputValidation>
		);
	}

	renderPrimarySite() {
		const { requestingMissingSites, translate, visibleSiteCount } = this.props;

		if ( ! visibleSiteCount ) {
			return (
				<Button
					href={ onboardingUrl() + '?ref=me-account-settings' }
					onClick={ this.getClickHandler( 'Primary Site Add New WordPress Button' ) }
				>
					{ translate( 'Add New Site' ) }
				</Button>
			);
		}

		const primarySiteId = this.getUserSetting( 'primary_site_ID' );

		return (
			<SitesDropdown
				key={ primarySiteId }
				isPlaceholder={ ! primarySiteId || requestingMissingSites }
				selectedSiteId={ primarySiteId }
				onSiteSelect={ this.onSiteSelect }
			/>
		);
	}

	shouldDisableAccountSubmitButton() {
		return (
			! this.hasUnsavedUserSettings( ACCOUNT_FIELDS ) ||
			this.getDisabledState( ACCOUNT_FORM_NAME ) ||
			this.hasEmailValidationError()
		);
	}

	shouldDisableInterfaceSubmitButton() {
		return (
			! this.hasUnsavedUserSettings( INTERFACE_FIELDS ) ||
			this.getDisabledState( INTERFACE_FORM_NAME )
		);
	}

	handleSubmitError( error, formName = '' ) {
		debug( 'Error saving settings: ' + JSON.stringify( error ) );

		if ( error.message ) {
			this.props.errorNotice( error.message, noticeOptions );
		} else {
			this.props.errorNotice(
				this.props.translate( 'There was a problem saving your changes.' ),
				noticeOptions
			);
		}

		this.setState( {
			submittingForm: false,
			formsSubmitting: {
				...this.state.formsSubmitting,
				...( formName && { [ formName ]: false } ),
			},
		} );
	}

	isSubmittingForm( formName ) {
		return formName ? this.state.formsSubmitting[ formName ] : this.state.submittingForm;
	}

	async handleSubmitSuccess( response, formName = '' ) {
		if ( ! this.hasUnsavedUserSettings( ACCOUNT_FIELDS.concat( INTERFACE_FIELDS ) ) ) {
			this.props.markSaved();
		}

		if ( this.state.redirect ) {
			await clearStore();

			// Sometimes changes in settings require a url refresh to update the UI.
			// For example when the user changes the language.
			window.location = this.state.redirect + '?updated=success';

			return;
		}

		// Determine success message based on what has been updated.
		const newEmail = response.new_user_email;
		const moreThanEmailChanged = Object.keys( response )?.find(
			( item ) => ! [ 'new_user_email', 'user_email', 'user_email_change_pending' ].includes( item )
		);

		// Default case.
		let successMessage = this.props.translate( 'Settings saved successfully!' );
		if ( newEmail && moreThanEmailChanged ) {
			// Email and other settings changed.
			successMessage = this.props.translate(
				'Settings saved successfully!{{br/}}We sent an email to %(email)s. Please check your inbox to verify your email.',
				{
					args: {
						email: newEmail || '',
					},
					components: {
						br: <br />,
					},
				}
			);
		} else if ( newEmail ) {
			// Only email changed.
			successMessage = this.props.translate(
				'We sent an email to %(email)s. Please check your inbox to verify your email.',
				{
					args: {
						email: newEmail || '',
					},
				}
			);
		}

		this.setState(
			{
				submittingForm: false,
				formsSubmitting: {
					...this.state.formsSubmitting,
					...( formName && { [ formName ]: false } ),
				},
			},
			() => {
				this.props.successNotice( successMessage, noticeOptions );
			}
		);
		debug( 'Settings saved successfully ' + JSON.stringify( response ) );
	}

	async submitForm( event, fields, formName = '' ) {
		event?.preventDefault && event.preventDefault();
		debug( 'Submitting form' );

		this.setState( {
			submittingForm: true,
			formsSubmitting: {
				...this.state.formsSubmitting,
				...( formName && { [ formName ]: true } ),
			},
		} );

		try {
			const response = await this.props.saveUnsavedUserSettings( fields );
			this.handleSubmitSuccess( response, formName );
		} catch ( error ) {
			this.handleSubmitError( error, formName );
		}
	}

	/*
	 * These form fields are displayed when there is not a username change in progress.
	 */
	renderAccountFields() {
		const { translate } = this.props;

		return (
			<div className="account__settings-form" key="settingsForm">
				<AccountEmailField
					emailInputId="user_email"
					emailInputName="user_email"
					emailValidationHandler={ ( isEmailValid ) =>
						this.setState( { emailValidationError: ! isEmailValid } )
					}
					isEmailControlDisabled={ this.getDisabledState( ACCOUNT_FORM_NAME ) }
					onFocus={ this.getFocusHandler( 'Email Address Field' ) }
					unsavedUserSettings={ this.props.unsavedUserSettings }
					userSettings={ this.props.userSettings }
				/>

				<FormFieldset>
					<FormLabel htmlFor="primary_site_ID">{ translate( 'Primary site' ) }</FormLabel>
					{ this.renderPrimarySite() }
				</FormFieldset>

				<FormButton
					isSubmitting={ this.isSubmittingForm( ACCOUNT_FORM_NAME ) }
					disabled={ this.shouldDisableAccountSubmitButton() }
					onClick={ this.handleSubmitButtonClick }
				>
					{ this.isSubmittingForm( ACCOUNT_FORM_NAME )
						? translate( 'Saving…' )
						: translate( 'Save account settings' ) }
				</FormButton>
			</div>
		);
	}

	renderBlogActionFields() {
		const { translate } = this.props;
		const actions = this.getAllowedActions();

		/*
		 * If there are no actions or if there is only one action,
		 * which we assume is the 'none' action, we ignore the actions.
		 */
		if ( size( actions ) <= 1 ) {
			return;
		}

		return (
			<FormFieldset>
				<FormLabel>{ translate( 'Would you like a matching blog address too?' ) }</FormLabel>
				{
					// message is translated in the API
					map( actions, ( message, key ) => (
						<FormLabel key={ key }>
							<FormRadio
								name="usernameAction"
								onChange={ this.handleRadioChange }
								onClick={ this.handleUsernameChangeBlogRadio }
								value={ key }
								checked={ key === this.state.usernameAction }
								label={ message }
							/>
						</FormLabel>
					) )
				}
			</FormFieldset>
		);
	}

	renderConfirmUsernameDialog() {
		const { currentUserDisplayName, currentUserName, translate } = this.props;

		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ), onClick: this.toggleConfirmUsernameForm },
			{
				action: 'confirm',
				label: translate( 'Change username' ),
				isPrimary: true,
				additionalClassNames: 'is-scary',
				onClick: this.submitUsernameForm,
			},
		];

		return (
			<Dialog
				isVisible={ this.state.showConfirmUsernameForm }
				additionalClassNames="account__confirm-username-dialog"
				buttons={ buttons }
				showCloseIcon
				onClose={ this.toggleConfirmUsernameForm }
			>
				<FormLabel>{ translate( 'Confirm username change' ) }</FormLabel>
				<p>
					{ translate(
						'You are about to change your username, {{strong}}%(username)s{{/strong}}. ' +
							'Once changed, you will not be able to revert it.',
						{
							args: {
								username: currentUserName,
							},
							components: {
								strong: <strong />,
							},
						}
					) }{ ' ' }
					{ translate(
						'Changing your username will also affect your Gravatar profile and IntenseDebate profile addresses.'
					) }
				</p>

				<p>
					{ translate(
						'If you just want to change your display name, {{strong}}%(displayName)s{{/strong}}, ' +
							'you can do so under {{myProfileLink}}My Profile{{/myProfileLink}}.',
						{
							args: {
								displayName: currentUserDisplayName,
							},
							components: {
								myProfileLink: (
									<a
										href="/me"
										onClick={ this.getClickHandler(
											'My Profile Link in Username Change',
											this.props.markSaved
										) }
									/>
								),
								strong: <strong />,
							},
						}
					) }
				</p>
			</Dialog>
		);
	}

	/*
	 * These form fields are displayed when a username change is in progress.
	 */
	renderUsernameFields() {
		const { translate } = this.props;

		const isSaveButtonDisabled =
			this.getUserSetting( 'user_login' ) !== this.state.userLoginConfirm ||
			! this.isUsernameValid() ||
			this.state.submittingForm;
		const usernameMatch =
			this.getUserSetting( 'user_login' ) === this.state.userLoginConfirm &&
			this.state.userLoginConfirm.length > 0;

		return (
			<div className="account__username-form" key="usernameForm">
				<FormFieldset>
					<FormLabel htmlFor="username_confirm">{ translate( 'Confirm new username' ) }</FormLabel>
					<FormTextInput
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						id="username_confirm"
						name="username_confirm"
						onFocus={ this.getFocusHandler( 'Username Confirm Field' ) }
						value={ this.state.userLoginConfirm ?? '' }
						onChange={ this.updateUserLoginConfirm }
						isValid={ usernameMatch }
						isError={ ! usernameMatch }
					/>
					<FormInputValidation isError={ ! usernameMatch }>
						{ usernameMatch
							? translate( 'Thanks for confirming your new username!' )
							: translate( 'Please re-enter your new username to confirm it.' ) }
					</FormInputValidation>
				</FormFieldset>

				{ this.renderBlogActionFields() }
				{ this.renderConfirmUsernameDialog() }

				<FormButtonsBar>
					<FormButton
						disabled={ isSaveButtonDisabled }
						type="button"
						onClick={ this.getClickHandler(
							'Change Username Button',
							this.toggleConfirmUsernameForm
						) }
					>
						{ translate( 'Change username' ) }
					</FormButton>

					<FormButton
						isPrimary={ false }
						type="button"
						onClick={ this.getClickHandler(
							'Cancel Username Change Button',
							this.cancelUsernameChange
						) }
					>
						{ translate( 'Cancel' ) }
					</FormButton>
				</FormButtonsBar>
			</div>
		);
	}

	saveAccountSettings = ( event ) => {
		this.submitForm( event, ACCOUNT_FIELDS, ACCOUNT_FORM_NAME );
	};

	saveInterfaceSettings = ( event ) => {
		this.submitForm( event, INTERFACE_FIELDS, INTERFACE_FORM_NAME );
	};

	render() {
		const { isFetching, markChanged, translate } = this.props;
		// Is a username change in progress?
		const renderUsernameForm = this.hasUnsavedUserSetting( 'user_login' );
		return (
			<Main wideLayout className="account">
				<QueryUserSettings />
				<PageViewTracker path="/me/account" title="Me > Account Settings" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Account settings' ) }
					subtitle={ translate(
						'Adjust your account information and interface settings. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="account-settings" showIcon={ false } />
								),
							},
						}
					) }
				/>

				<SectionHeader label={ translate( 'Account Information' ) } />
				<Card className="account__settings">
					<form onChange={ markChanged } onSubmit={ this.saveAccountSettings }>
						<FormFieldset>
							<FormLabel htmlFor="user_login">{ translate( 'Username' ) }</FormLabel>
							<FormTextInput
								autoCapitalize="off"
								autoComplete="off"
								autoCorrect="off"
								className="account__username"
								disabled={
									this.getDisabledState( ACCOUNT_FORM_NAME ) ||
									! this.getUserSetting( 'user_login_can_be_changed' )
								}
								id="user_login"
								name="user_login"
								onFocus={ this.getFocusHandler( 'Username Field' ) }
								onChange={ this.handleUsernameChange }
								value={ this.getUserSetting( 'user_login' ) || '' }
								isValid={ renderUsernameForm && this.isUsernameValid() }
								isError={
									renderUsernameForm && null !== this.getUsernameValidationFailureMessage()
								}
							/>
							{ renderUsernameForm ? (
								this.renderUsernameValidation()
							) : (
								<FormSettingExplanation>{ this.renderJoinDate() }</FormSettingExplanation>
							) }
						</FormFieldset>

						{ /* This is how we animate showing/hiding the form field sections */ }
						<TransitionGroup>
							<CSSTransition
								key={ renderUsernameForm ? 'username' : 'account' }
								classNames="account__username-form-toggle"
								timeout={ { enter: 500, exit: 10 } }
							>
								{ renderUsernameForm ? this.renderUsernameFields() : this.renderAccountFields() }
							</CSSTransition>
						</TransitionGroup>
					</form>
				</Card>

				<SectionHeader label={ translate( 'Interface settings' ) } />
				<Card className="account__settings">
					<form onSubmit={ this.saveInterfaceSettings }>
						<FormFieldset>
							<FormLabel id="account__language" htmlFor="language">
								{ translate( 'Interface language' ) }
							</FormLabel>
							<LanguagePicker
								disabled={ this.getDisabledState( INTERFACE_FORM_NAME ) }
								isLoading={ isFetching }
								languages={ languages }
								onClick={ this.getClickHandler( 'Interface Language Field' ) }
								valueKey="langSlug"
								value={
									this.getUserSetting( 'locale_variant' ) || this.getUserSetting( 'language' ) || ''
								}
								empathyMode={ this.getUserSetting( 'i18n_empathy_mode' ) }
								useFallbackForIncompleteLanguages={ this.getUserSetting(
									'use_fallback_for_incomplete_languages'
								) }
								onChange={ this.updateLanguage }
							/>
							<FormSettingExplanation>
								{ translate(
									'This is the language of the interface you see across WordPress.com as a whole.'
								) }
							</FormSettingExplanation>
							{ this.thankTranslationContributors() }
						</FormFieldset>

						{ this.props.canDisplayCommunityTranslator && (
							<FormFieldset className="account__settings-admin-home">
								<FormLabel id="account__default_landing_page">
									{ translate( 'Community Translator' ) }
								</FormLabel>
								<ToggleUseCommunityTranslator />
							</FormFieldset>
						) }

						<FormFieldset className="account__settings-admin-home">
							<FormLabel id="account__default_landing_page">
								{ translate( 'Default Landing Page' ) }
							</FormLabel>
							<ToggleLandingPageSettings />
							<FormSettingExplanation>
								{ translate(
									'When you type https://www.wordpress.com in your browser, this is the page you land on.'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLabel id="account__color_scheme" htmlFor="color_scheme">
								{ translate( 'Dashboard color scheme' ) }
							</FormLabel>
							<FormSettingExplanation>
								{ translate(
									'You can now set the color scheme on your individual site by visiting Users → Profile from your site dashboard.'
								) }
							</FormSettingExplanation>
						</FormFieldset>
					</form>
				</Card>

				{ config.isEnabled( 'me/account-close' ) && <AccountSettingsCloseLink /> }
			</Main>
		);
	}
}

export default compose(
	localize,
	withLocalizedMoment,
	withGeoLocation,
	protectForm,
	connect(
		( state ) => ( {
			canDisplayCommunityTranslator: canDisplayCommunityTranslator( state ),
			currentUserDate: getCurrentUserDate( state ),
			currentUserDisplayName: getCurrentUserDisplayName( state ),
			currentUserName: getCurrentUserName( state ),
			isFetching: isFetchingUserSettings( state ),
			requestingMissingSites: isRequestingMissingSites( state ),
			userSettings: getUserSettings( state ),
			unsavedUserSettings: getUnsavedUserSettings( state ),
			visibleSiteCount: getCurrentUserVisibleSiteCount( state ),
		} ),
		{
			clearUnsavedUserSettings,
			errorNotice,
			removeNotice,
			recordGoogleEvent,
			recordTracksEvent,
			removeUnsavedUserSetting,
			saveUnsavedUserSettings,
			setUserSetting,
			successNotice,
		}
	)
)( Account );
