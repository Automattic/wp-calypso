/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
import emailValidator from 'email-validator';
import { debounce, flowRight as compose, get, has, map, size, update } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import LanguagePicker from 'components/language-picker';
import MeSidebarNavigation from 'me/sidebar-navigation';
import { protectForm } from 'lib/protect-form';
import formBase from 'me/form-base';
import config from 'config';
import { languages } from 'languages';
import { supportsCssCustomProperties } from 'lib/feature-detection';
import { Card, Button } from '@automattic/components';
import FormTextInput from 'components/forms/form-text-input';
import FormTextValidation from 'components/forms/form-input-validation';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormRadio from 'components/forms/form-radio';
import { recordGoogleEvent, recordTracksEvent, bumpStat } from 'state/analytics/actions';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import observe from 'lib/mixins/data-observe'; // eslint-disable-line no-restricted-imports
import Main from 'components/main';
import SitesDropdown from 'components/sites-dropdown';
import ColorSchemePicker from 'blocks/color-scheme-picker';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getLanguage, isLocaleVariant, canBeTranslated } from 'lib/i18n-utils';
import isRequestingMissingSites from 'state/selectors/is-requesting-missing-sites';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import _user from 'lib/user';
import { canDisplayCommunityTranslator } from 'components/community-translator/utils';
import { ENABLE_TRANSLATOR_KEY } from 'lib/i18n-utils/constants';
import AccountSettingsCloseLink from './close-link';
import { requestGeoLocation } from 'state/data-getters';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

const user = _user();
const colorSchemeKey = 'calypso_preferences.colorScheme';

/**
 * Debug instance
 */
const debug = debugFactory( 'calypso:me:account' );

/* eslint-disable react/prefer-es6-class */
const Account = createReactClass( {
	displayName: 'Account',

	// form-base mixin is needed for getDisabledState() (and possibly other uses?)
	mixins: [ formBase, observe( 'userSettings', 'username' ) ],

	propTypes: {
		userSettings: PropTypes.object.isRequired,
		username: PropTypes.object.isRequired,
		showNoticeInitially: PropTypes.bool,
	},

	UNSAFE_componentWillMount() {
		// Clear any username changes that were previously made
		this.props.username.clearValidation();
		this.props.userSettings.removeUnsavedSetting( 'user_login' );
	},

	componentDidMount() {
		debug( this.constructor.displayName + ' component is mounted.' );
		this.debouncedUsernameValidate = debounce( this.validateUsername, 600 );
	},

	componentWillUnmount() {
		debug( this.constructor.displayName + ' component is unmounting.' );
	},

	getUserSetting( settingName ) {
		return this.props.userSettings.getSetting( settingName );
	},

	getUserOriginalSetting( settingName ) {
		return this.props.userSettings.getOriginalSetting( settingName );
	},

	updateUserSetting( settingName, value ) {
		this.props.userSettings.updateSetting( settingName, value );
	},

	updateUserSettingInput( event ) {
		this.updateUserSetting( event.target.name, event.target.value );
	},

	updateUserSettingCheckbox( event ) {
		this.updateUserSetting( event.target.name, event.target.checked );
	},

	updateCommunityTranslatorSetting( event ) {
		const { name, checked } = event.target;
		this.updateUserSetting( name, checked );
		const redirect = '/me/account';
		this.setState( { redirect } );
	},

	updateLanguage( event ) {
		const { value } = event.target;
		this.updateUserSetting( 'language', value );
		const redirect =
			value !== this.getUserOriginalSetting( 'language' ) ||
			value !== this.getUserOriginalSetting( 'locale_variant' )
				? '/me/account'
				: false;
		// store any selected locale variant so we can test it against those with no GP translation sets
		const localeVariantSelected = isLocaleVariant( value ) ? value : '';
		this.setState( { redirect, localeVariantSelected } );
	},

	updateColorScheme( colorScheme ) {
		// Set a fallback color scheme if no default value is provided by the API.
		// This is a workaround that allows us to use userSettings.updateSetting() without an
		// existing value. Without this workaround the save button wouldn't become active.
		// TODO: the API should provide a default value, which would make this line obsolete
		update( this.props.userSettings.settings, colorSchemeKey, ( value ) => value || 'default' );

		this.props.recordTracksEvent( 'calypso_color_schemes_select', { color_scheme: colorScheme } );
		this.props.recordGoogleEvent( 'Me', 'Selected Color Scheme', 'scheme', colorScheme );
		this.updateUserSetting( colorSchemeKey, colorScheme );
	},

	getEmailAddress() {
		return this.hasPendingEmailChange()
			? this.getUserSetting( 'new_user_email' )
			: this.getUserSetting( 'user_email' );
	},

	updateEmailAddress( event ) {
		const { value } = event.target;
		const emailValidationError =
			( '' === value && 'empty' ) || ( ! emailValidator.validate( value ) && 'invalid' ) || false;
		this.setState( { emailValidationError } );
		this.updateUserSetting( 'user_email', value );
	},

	updateUserLoginConfirm( event ) {
		this.setState( { userLoginConfirm: event.target.value } );
	},

	validateUsername() {
		const username = this.getUserSetting( 'user_login' );
		debug( 'Validating username ' + username );
		this.props.username.validate( username );
	},

	hasEmailValidationError() {
		return !! this.state.emailValidationError;
	},

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
	},

	communityTranslator() {
		if ( ! this.shouldDisplayCommunityTranslator() ) {
			return;
		}
		const { translate } = this.props;
		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Community Translator' ) }</FormLegend>
				<FormLabel htmlFor={ ENABLE_TRANSLATOR_KEY }>
					<FormCheckbox
						checked={ this.getUserSetting( ENABLE_TRANSLATOR_KEY ) }
						onChange={ this.updateCommunityTranslatorSetting }
						disabled={ this.getDisabledState() }
						id={ ENABLE_TRANSLATOR_KEY }
						name={ ENABLE_TRANSLATOR_KEY }
						onClick={ this.getCheckboxHandler( 'Community Translator' ) }
					/>
					<span>
						{ translate( 'Enable the in-page translator where available. {{a}}Learn more{{/a}}', {
							components: {
								a: (
									<a
										target="_blank"
										rel="noopener noreferrer"
										href="https://translate.wordpress.com/community-translator/"
										onClick={ this.getClickHandler( 'Community Translator Learn More Link' ) }
									/>
								),
							},
						} ) }
					</span>
				</FormLabel>
			</FormFieldset>
		);
	},

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
	},

	cancelEmailChange() {
		const { translate, userSettings } = this.props;
		userSettings.cancelPendingEmailChange( ( error, response ) => {
			if ( error ) {
				debug( 'Error canceling email change: ' + JSON.stringify( error ) );
				this.props.errorNotice(
					translate( 'There was a problem canceling the email change. Please, try again.' )
				);
			} else {
				debug( JSON.stringify( 'Email change canceled successfully' + response ) );
				this.props.successNotice( translate( 'The email change has been successfully canceled.' ) );
			}
		} );
	},

	handleRadioChange( event ) {
		const { name, value } = event.currentTarget;
		this.setState( { [ name ]: value } );
	},

	handleSubmitButtonClick() {
		const { unsavedSettings } = this.props.userSettings;
		this.recordClickEvent( 'Save Account Settings Button' );
		if ( has( unsavedSettings, colorSchemeKey ) ) {
			const colorScheme = get( unsavedSettings, colorSchemeKey );
			this.props.recordTracksEvent( 'calypso_color_schemes_save', {
				color_scheme: colorScheme,
			} );
			this.props.recordGoogleEvent( 'Me', 'Saved Color Scheme', 'scheme', colorScheme );
			this.props.bumpStat( 'calypso_changed_color_scheme', colorScheme );
		}

		if ( has( unsavedSettings, 'language' ) ) {
			this.props.recordTracksEvent( 'calypso_user_language_switch', {
				new_language: this.getUserSetting( 'language' ),
				previous_language:
					this.getUserOriginalSetting( 'locale_variant' ) ||
					this.getUserOriginalSetting( 'language' ),
				country_code: this.props.countryCode,
			} );
		}
	},

	/**
	 * We handle the username (user_login) change manually through an onChange handler
	 * so that we can also run a debounced validation on the username.
	 *
	 * @param {object} event Event from onChange of user_login input
	 */
	handleUsernameChange( event ) {
		this.debouncedUsernameValidate();
		this.updateUserSetting( 'user_login', event.currentTarget.value );
		this.setState( { usernameAction: null } );
	},

	recordClickEvent( action ) {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	},

	getClickHandler( action, callback ) {
		return () => {
			this.recordClickEvent( action );

			if ( callback ) {
				callback();
			}
		};
	},

	getFocusHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	},

	getCheckboxHandler( checkboxName ) {
		return ( event ) => {
			const action = 'Clicked ' + checkboxName + ' checkbox';
			const value = event.target.checked ? 1 : 0;

			this.props.recordGoogleEvent( 'Me', action, 'checked', value );
		};
	},

	handleUsernameChangeBlogRadio( event ) {
		this.props.recordGoogleEvent(
			'Me',
			'Clicked Username Change Blog Action radio',
			'checked',
			event.target.value
		);
	},

	cancelUsernameChange() {
		this.setState( {
			userLoginConfirm: null,
			usernameAction: null,
		} );

		this.props.username.clearValidation();
		this.props.userSettings.removeUnsavedSetting( 'user_login' );

		if ( ! this.props.userSettings.hasUnsavedSettings() ) {
			this.props.markSaved();
		}
	},

	submitUsernameForm() {
		const username = this.getUserSetting( 'user_login' );
		const action = null === this.state.usernameAction ? 'none' : this.state.usernameAction;

		this.setState( { submittingForm: true } );
		this.props.username.change( username, action, ( error ) => {
			this.setState( { submittingForm: false } );
			if ( error ) {
				this.props.errorNotice( this.props.username.getValidationFailureMessage() );
			} else {
				this.props.markSaved();

				// We reload here to refresh cookies, user object, and user settings.
				// @TODO: Do not require reload here.
				window.location.reload();
			}
		} );
	},

	onSiteSelect( siteId ) {
		if ( siteId ) {
			this.updateUserSetting( 'primary_site_ID', siteId );
		}
	},

	renderJoinDate() {
		const { translate, moment } = this.props;
		const dateMoment = moment( user.get().date );

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
	},

	hasPendingEmailChange() {
		return this.props.userSettings.isPendingEmailChange();
	},

	renderPendingEmailChange() {
		const { translate } = this.props;

		if ( ! this.hasPendingEmailChange() ) {
			return null;
		}

		return (
			<Notice
				showDismiss={ false }
				status="is-info"
				text={ translate(
					'There is a pending change of your email to %(email)s. Please check your inbox for a confirmation link.',
					{
						args: {
							email: this.getUserSetting( 'new_user_email' ),
						},
					}
				) }
			>
				<NoticeAction onClick={ this.cancelEmailChange }>{ translate( 'Cancel' ) }</NoticeAction>
			</Notice>
		);
	},

	renderUsernameValidation() {
		const { translate, username, userSettings } = this.props;

		if ( ! userSettings.isSettingUnsaved( 'user_login' ) ) {
			return null;
		}

		if ( username.isUsernameValid() ) {
			return (
				<Notice
					showDismiss={ false }
					status="is-success"
					text={ translate( '%(username)s is a valid username.', {
						args: {
							username: username.getValidatedUsername(),
						},
					} ) }
				/>
			);
		} else if ( null !== username.getValidationFailureMessage() ) {
			return (
				<Notice
					showDismiss={ false }
					status="is-error"
					text={ username.getValidationFailureMessage() }
				/>
			);
		}
	},

	renderUsernameConfirmNotice() {
		const { translate, username } = this.props;
		const usernameMatch = this.getUserSetting( 'user_login' ) === this.state.userLoginConfirm;
		const status = usernameMatch ? 'is-success' : 'is-error';
		const text = usernameMatch
			? translate( 'Thanks for confirming your new username!' )
			: translate( 'Please re-enter your new username to confirm it.' );

		if ( ! username.isUsernameValid() ) {
			return null;
		}

		return <Notice showDismiss={ false } status={ status } text={ text } />;
	},

	renderPrimarySite() {
		const { requestingMissingSites, translate } = this.props;

		if ( ! user.get().visible_site_count ) {
			return (
				<Button
					href={ config( 'signup_url' ) }
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
	},

	renderEmailValidation() {
		const { translate, userSettings } = this.props;

		if ( ! userSettings.isSettingUnsaved( 'user_email' ) ) {
			return null;
		}

		if ( ! this.state.emailValidationError ) {
			return null;
		}
		let notice;
		switch ( this.state.emailValidationError ) {
			case 'invalid':
				notice = translate( '%(email)s is not a valid email address.', {
					args: { email: this.getUserSetting( 'user_email' ) },
				} );
				break;
			case 'empty':
				notice = translate( 'Email address can not be empty.' );
				break;
		}

		return <FormTextValidation isError={ true } text={ notice } />;
	},

	/*
	 * These form fields are displayed when there is not a username change in progress.
	 */
	renderAccountFields() {
		const { translate, userSettings } = this.props;

		const isSubmitButtonDisabled =
			! userSettings.hasUnsavedSettings() ||
			this.getDisabledState() ||
			this.hasEmailValidationError();

		return (
			<div className="account__settings-form" key="settingsForm">
				<FormFieldset>
					<FormLabel htmlFor="user_email">{ translate( 'Email Address' ) }</FormLabel>
					<FormTextInput
						disabled={ this.getDisabledState() || this.hasPendingEmailChange() }
						id="user_email"
						name="user_email"
						isError={ !! this.state.emailValidationError }
						onFocus={ this.getFocusHandler( 'Email Address Field' ) }
						value={ this.getEmailAddress() || '' }
						onChange={ this.updateEmailAddress }
					/>
					{ this.renderEmailValidation() }
					{ this.renderPendingEmailChange() }
					<FormSettingExplanation>
						{ translate( 'Will not be publicly displayed' ) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="primary_site_ID">{ translate( 'Primary Site' ) }</FormLabel>
					{ this.renderPrimarySite() }
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="user_URL">{ translate( 'Web Address' ) }</FormLabel>
					<FormTextInput
						disabled={ this.getDisabledState() }
						id="user_URL"
						name="user_URL"
						type="url"
						onFocus={ this.getFocusHandler( 'Web Address Field' ) }
						value={ this.getUserSetting( 'user_URL' ) || '' }
						onChange={ this.updateUserSettingInput }
					/>
					<FormSettingExplanation>
						{ translate( 'Shown publicly when you comment on blogs.' ) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="language">{ translate( 'Interface Language' ) }</FormLabel>
					<LanguagePicker
						disabled={ this.getDisabledState() }
						languages={ languages }
						onClick={ this.getClickHandler( 'Interface Language Field' ) }
						valueKey="langSlug"
						value={
							this.getUserSetting( 'locale_variant' ) || this.getUserSetting( 'language' ) || ''
						}
						onChange={ this.updateLanguage }
					/>
					<FormSettingExplanation>
						{ translate(
							'This is the language of the interface you see across WordPress.com as a whole.'
						) }
					</FormSettingExplanation>
					{ this.thankTranslationContributors() }
				</FormFieldset>

				{ canDisplayCommunityTranslator( this.getUserSetting( 'language' ) ) &&
					this.communityTranslator() }

				{ config.isEnabled( 'me/account/color-scheme-picker' ) && supportsCssCustomProperties() && (
					<FormFieldset>
						<FormLabel htmlFor="color_scheme">{ translate( 'Dashboard Color Scheme' ) }</FormLabel>
						<ColorSchemePicker temporarySelection onSelection={ this.updateColorScheme } />
					</FormFieldset>
				) }

				<FormButton
					isSubmitting={ this.state.submittingForm }
					disabled={ isSubmitButtonDisabled }
					onClick={ this.handleSubmitButtonClick }
				>
					{ this.state.submittingForm
						? translate( 'Saving…' )
						: translate( 'Save account settings' ) }
				</FormButton>
			</div>
		);
	},

	renderBlogActionFields() {
		const { translate, username } = this.props;
		const actions = username.getAllowedActions();

		/*
		 * If there are no actions or if there is only one action,
		 * which we assume is the 'none' action, we ignore the actions.
		 */
		if ( size( actions ) <= 1 ) {
			return;
		}

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Would you like a matching blog address too?' ) }</FormLegend>
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
							/>
							<span>{ message }</span>
						</FormLabel>
					) )
				}
			</FormFieldset>
		);
	},

	/*
	 * These form fields are displayed when a username change is in progress.
	 */
	renderUsernameFields() {
		const { translate, username } = this.props;

		const isSaveButtonDisabled =
			this.getUserSetting( 'user_login' ) !== this.state.userLoginConfirm ||
			! username.isUsernameValid() ||
			this.state.submittingForm;

		return (
			<div className="account__username-form" key="usernameForm">
				<FormFieldset>
					<FormLabel htmlFor="username_confirm">
						{ translate( 'Confirm Username', {
							context: 'User is being prompted to re-enter a string for verification.',
						} ) }
					</FormLabel>
					<FormTextInput
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						id="username_confirm"
						name="username_confirm"
						onFocus={ this.getFocusHandler( 'Username Confirm Field' ) }
						value={ this.state.userLoginConfirm }
						onChange={ this.updateUserLoginConfirm }
					/>
					{ this.renderUsernameConfirmNotice() }
					<FormSettingExplanation>{ translate( 'Confirm new username' ) }</FormSettingExplanation>
				</FormFieldset>

				{ this.renderBlogActionFields() }

				<FormSectionHeading>{ translate( 'Please Read Carefully' ) }</FormSectionHeading>

				<p>
					{ translate(
						'You are about to change your username, which is currently {{strong}}%(username)s{{/strong}}. ' +
							'You will not be able to change your username back.',
						{
							args: {
								username: user.get().username,
							},
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>

				<p>
					{ translate(
						'If you just want to change your display name, which is currently {{strong}}%(displayName)s{{/strong}}, ' +
							'you can do so under {{myProfileLink}}My Profile{{/myProfileLink}}.',
						{
							args: {
								displayName: user.get().display_name,
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

				<p>
					{ translate(
						'Changing your username will also affect your Gravatar profile and IntenseDebate profile addresses.'
					) }
				</p>

				<p>
					{ translate(
						'If you would still like to change your username, please save your changes. Otherwise, hit the cancel button below.'
					) }
				</p>

				<FormButtonsBar>
					<FormButton
						disabled={ isSaveButtonDisabled }
						type="button"
						onClick={ this.getClickHandler( 'Change Username Button', this.submitUsernameForm ) }
					>
						{ translate( 'Save username' ) }
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
	},

	render() {
		const { markChanged, translate, userSettings } = this.props;
		// Is a username change in progress?
		const renderUsernameForm = userSettings.isSettingUnsaved( 'user_login' );

		return (
			<Main className="account">
				<PageViewTracker path="/me/account" title="Me > Account Settings" />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card className="account__settings">
					<form onChange={ markChanged } onSubmit={ this.submitForm }>
						<FormFieldset>
							<FormLabel htmlFor="user_login">{ translate( 'Username' ) }</FormLabel>
							<FormTextInput
								autoCapitalize="off"
								autoComplete="off"
								autoCorrect="off"
								className="account__username"
								disabled={
									this.getDisabledState() || ! this.getUserSetting( 'user_login_can_be_changed' )
								}
								id="user_login"
								name="user_login"
								onFocus={ this.getFocusHandler( 'Username Field' ) }
								onChange={ this.handleUsernameChange }
								value={ this.getUserSetting( 'user_login' ) || '' }
							/>
							{ this.renderUsernameValidation() }
							<FormSettingExplanation>{ this.renderJoinDate() }</FormSettingExplanation>
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

				{ config.isEnabled( 'me/account-close' ) && <AccountSettingsCloseLink /> }
			</Main>
		);
	},
} );

export default compose(
	connect(
		( state ) => ( {
			requestingMissingSites: isRequestingMissingSites( state ),
			countryCode: requestGeoLocation().data,
		} ),
		{ bumpStat, errorNotice, recordGoogleEvent, recordTracksEvent, successNotice }
	),
	localize,
	withLocalizedMoment,
	protectForm
)( Account );
