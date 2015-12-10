/**
 * External dependencies
 */
var React = require( 'react' ),
	i18n = require( 'lib/mixins/i18n' ),
	debug = require( 'debug' )( 'calypso:me:account' ),
	emailValidator = require( 'email-validator' ),
	_debounce = require( 'lodash/function/debounce' ),
	_map = require( 'lodash/collection/map' ),
	_size = require( 'lodash/collection/size' ),
	ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/**
 * Internal dependencies
 */
var LanguageSelector = require( 'components/forms/language-selector' ),
	MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	protectForm = require( 'lib/mixins/protect-form' ),
	sites = require( 'lib/sites-list' )(),
	formBase = require( 'me/form-base' ),
	SelectSite = require( 'me/select-site' ),
	config = require( 'config' ),
	Card = require( 'components/card' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	FormTextValidation = require( 'components/forms/form-input-validation' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormLegend = require( 'components/forms/form-legend' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	FormRadio = require( 'components/forms/form-radio' ),
	ReauthRequired = require( 'me/reauth-required' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	user = require( 'lib/user' )(),
	Notice = require( 'components/notice' ),
	NoticeAction = require( 'components/notice/notice-action' ),
	notices = require( 'notices' ),
	observe = require( 'lib/mixins/data-observe' ),
	eventRecorder = require( 'me/event-recorder' ),
	Main = require( 'components/main' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {

	displayName: 'Account',

	mixins: [
		formBase,
		React.addons.LinkedStateMixin,
		protectForm.mixin,
		observe( 'userSettings', 'username' ),
		eventRecorder
	],

	componentWillMount: function() {
		// Clear any username changes that were previously made
		this.props.username.clearValidation();
		this.props.userSettings.removeUnsavedSetting( 'user_login' );
	},

	componentDidMount: function() {
		debug( this.constructor.displayName + ' component is mounted.' );
		this.debouncedUsernameValidate = _debounce( this.validateUsername, 600 );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' component is unmounting.' );
	},

	updateLanguage: function() {
		var valueLink = this.valueLink( 'language' );

		valueLink.requestChange = function( value ) {
			var originalLanguage = this.props.userSettings.getOriginalSetting( 'language' );

			this.props.userSettings.updateSetting( 'language', value );
			if ( value !== originalLanguage ) {
				this.setState( { redirect: '/me/account' } );
			} else {
				this.setState( { redirect: false } );
			}
		}.bind( this );

		return valueLink;
	},

	validateUsername: function() {
		var username = this.props.userSettings.getSetting( 'user_login' );
		debug( 'Validating username ' + username );
		this.props.username.validate( username );
	},

	hadFormError: function() {
		return this.state.emailValidationError;
	},

	communityTranslator: function() {
		if ( config.isEnabled( 'community-translator' ) ) {
			return (
				<FormFieldset>
					<FormLegend>{ this.translate( 'Community Translator' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox
							checkedLink={ this.valueLink( 'enable_translator' ) }
							disabled={ this.getDisabledState() }
							id="enable_translator"
							name="enable_translator"
							onClick={ this.recordCheckboxEvent( 'Community Translator' ) } />
						<span>
							{ this.translate( 'Enable the in-page translator where available. {{a}}Learn more{{/a}}', {
								components: {
									a: <a
											target="_blank"
											href="https://en.support.wordpress.com/community-translator/"
											onClick={ this.recordClickEvent( 'Community Translator Learn More Link' ) }
									/>
								}
							} ) }
						</span>
					</FormLabel>
				</FormFieldset>
			);
		}
	},

	getOptoutText: function( website ) {
		return this.translate( '%(website)s opt-out', {
			args: { website: website },
			context: 'A website address, formatted to look like "Website.com"'
		} );
	},

	cancelEmailChange: function() {
		this.props.userSettings.cancelPendingEmailChange( function( error, response ) {
			if ( error ) {
				debug( 'Error canceling email change: ' + JSON.stringify( error ) );
				notices.error( this.translate( 'There was a problem canceling the email change. Please, try again.' ) );
			} else {
				debug( JSON.stringify( 'Email change canceled successfully' + response ) );
				notices.success( this.translate( 'The email change has been successfully canceled.' ) );
			}
		}.bind( this )
		);
	},

	handleRadioChange: function( event ) {
		var name = event.currentTarget.name,
			value = event.currentTarget.value,
			updateObj = {};

		updateObj[ name ] = value;

		this.setState( updateObj );
	},

	/**
	 * We handle the username (user_login) change manually through an onChange handler
	 * so that we can also run a debounced validation on the username.
	 *
	 * @param {object} event Event from onChange of user_login input
	 */
	handleUsernameChange: function( event ) {
		this.debouncedUsernameValidate();
		this.props.userSettings.updateSetting( 'user_login', event.currentTarget.value );
		this.setState( { usernameAction: null } );
	},

	cancelUsernameChange: function() {
		this.setState( {
			userLoginConfirm: null,
			usernameAction: null
		} );

		this.props.username.clearValidation();
		this.props.userSettings.removeUnsavedSetting( 'user_login' );

		if ( ! this.props.userSettings.hasUnsavedSettings() ) {
			this.markSaved();
		}
	},

	submitUsernameForm: function() {
		var username = this.props.userSettings.getSetting( 'user_login' ),
			action = null === this.state.usernameAction ? 'none' : this.state.usernameAction;

		this.setState( { submittingForm: true } );
		this.props.username.change( username, action, function( error ) {
			this.setState( { submittingForm: false } );
			if ( error ) {
				notices.error( this.props.username.getValidationFailureMessage() );
			} else {
				this.markSaved();

				// We reload here to refresh cookies, user object, and user settings.
				// @TODO: Do not require reload here.
				location.reload();
			}
		}.bind( this ) );
	},

	renderHolidaySnow() {
		// Note that years and months below are zero indexed
		let today = this.moment(),
			startDate = this.moment( {
				year: today.year(),
				month: 11,
				day: 1
			} ),
			endDate = this.moment( {
				year: today.year(),
				month: 0,
				day: 4
			} );

		if ( today.isBefore( startDate, 'day' ) && today.isAfter( endDate, 'day' ) ) {
			return;
		}

		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'Holiday Snow' ) }</FormLegend>
				<FormLabel>
					<FormCheckbox
						checkedLink={ this.valueLink( 'holidaysnow' ) }
						disabled={ this.getDisabledState() }
						id="holidaysnow"
						name="holidaysnow"
						onClick={ this.recordCheckboxEvent( 'Holiday Snow' ) } />
					<span>{ this.translate( 'Show snowfall on WordPress.com sites.' ) }</span>
				</FormLabel>
			</FormFieldset>
		);
	},

	renderJoinDate: function() {
		var dateMoment = i18n.moment( user.get().date );

		return (
			<span>
				{
					this.translate( 'Joined %(month)s %(year)s', {
						args: {
							month: dateMoment.format( 'MMMM' ),
							year: dateMoment.format( 'YYYY' )
						}
					} )
				}
			</span>
		);
	},

	hasPendingEmailChange: function() {
		return this.props.userSettings.isPendingEmailChange();
	},

	renderPendingEmailChange: function() {
		if ( ! this.hasPendingEmailChange() ) {
			return null;
		}

		return (
			<Notice
				isCompact={ true }
				showDismiss={ false }
				status="is-info"
				text={
					this.translate( 'There is a pending change of your email to %(email)s. Please check your inbox for a confirmation link.', {
						args: {
							email: this.props.userSettings.getSetting( 'new_user_email' )
						}
					} )
				}>
				<NoticeAction onClick={ this.cancelEmailChange }>
					{ this.translate( 'Cancel' ) }
				</NoticeAction>
			</Notice>
		);
	},

	renderUsernameValidation: function() {
		if ( ! this.props.userSettings.isSettingUnsaved( 'user_login' ) ) {
			return null;
		}

		if ( this.props.username.isUsernameValid() ) {
			return (
				<Notice
					isCompact={ true }
					showDismiss={ false }
					status="is-success"
					text={ this.translate( '%(username)s is a valid username.', {
						args: {
							username: this.props.username.getValidatedUsername()
						}
					} ) } />
			);
		} else if ( null !== this.props.username.getValidationFailureMessage() ) {
			return (
				<Notice
					isCompact={ true }
					showDismiss={ false }
					status="is-error"
					text={ this.props.username.getValidationFailureMessage() } />
			);
		}
	},

	renderUsernameConfirmNotice: function() {
		var usernameMatch = this.props.userSettings.getSetting( 'user_login' ) === this.state.userLoginConfirm,
			status = usernameMatch ? 'is-success' : 'is-error',
			text = usernameMatch ? this.translate( 'Thanks for confirming your new username!' ) : this.translate( 'Please re-enter your new username to confirm it.' );

		if ( ! this.props.username.isUsernameValid() ) {
			return null;
		}

		return (
			<Notice
				isCompact={ true }
				showDismiss={ false }
				status={ status }
				text={ text } />
		);
	},

	renderPrimarySite: function() {
		if ( ! user.get().visible_site_count ) {
			return (
				<a
					className="button"
					href={ config( 'signup_url' ) }
					onClick={ this.recordClickEvent( 'Primary Site Add New WordPress Button' ) }
				>
					{ this.translate( 'Add New WordPress' ) }
				</a>
			);
		}

		return (
			<SelectSite
				disabled={ this.getDisabledState() }
				id="primary_site_ID"
				name="primary_site_ID"
				onFocus={ this.recordFocusEvent( 'Primary Site Field' ) }
				sites={ sites }
				valueLink={ this.valueLink( 'primary_site_ID' ) } />
		);
	},

	updateEmailAddress: function() {
		return {
			value: this.hasPendingEmailChange()
				? this.props.userSettings.getSetting( 'new_user_email' )
				: this.props.userSettings.getSetting( 'user_email' ),
			requestChange: function( value ) {
				if ( '' === value ) {
					this.setState( { emailValidationError: 'empty' } );
				} else if ( ! emailValidator.validate( value ) ) {
					this.setState( { emailValidationError: 'invalid' } );
				} else {
					this.setState( { emailValidationError: false } );
				}
				this.props.userSettings.updateSetting( 'user_email', value );
			}.bind( this )
		};
	},

	renderEmailValidation: function() {
		if ( ! this.props.userSettings.isSettingUnsaved( 'user_email' ) ) {
			return null;
		}

		if ( ! this.state.emailValidationError ) {
			return null;
		}
		let notice;
		switch ( this.state.emailValidationError ) {
			case 'invalid':
				notice = this.translate( '%(email)s is not a valid email address.', {
					args: { email: this.props.userSettings.getSetting( 'user_email' ) }
				} );
				break;
			case 'empty':
				notice = this.translate( 'Email address can not be empty.' );
				break;
		}

		return (
			<FormTextValidation isError={ true } text={ notice } />
		);
	},

	/*
	 * These form fields are displayed when there is not a username change in progress.
	 */
	renderAccountFields: function() {
		return (
			<div className="account__settings-form" key="settingsForm">
				<FormFieldset>
					<FormLabel htmlFor="email">{ this.translate( 'Email Address' ) }</FormLabel>
					<FormTextInput
						disabled={ this.getDisabledState() || this.hasPendingEmailChange() }
						id="email"
						name="email"
						isError={ !! this.state.emailValidationError }
						onFocus={ this.recordFocusEvent( 'Email Address Field' ) }
						valueLink={ this.updateEmailAddress() }
						valueKey="user_email" />
					{ this.renderEmailValidation() }
					{ this.renderPendingEmailChange() }
					<FormSettingExplanation>{ this.translate( 'Will not be publicly displayed' ) }</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="primary_site_ID">{ this.translate( 'Primary Site' ) }</FormLabel>
					{ this.renderPrimarySite() }
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="url">{ this.translate( 'Web Address' ) }</FormLabel>
					<FormTextInput
						disabled={ this.getDisabledState() }
						id="url"
						name="url"
						onFocus={ this.recordFocusEvent( 'Web Address Field' ) }
						valueLink={ this.valueLink( 'user_URL' ) } />
					<FormSettingExplanation>{ this.translate( 'Shown publicly when you comment on blogs.' ) }</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="lang_id">{ this.translate( 'Interface Language' ) }</FormLabel>
					<LanguageSelector
						disabled={ this.getDisabledState() }
						id="lang_id"
						languages={ config( 'languages' ) }
						name="lang_id"
						onFocus={ this.recordFocusEvent( 'Interface Language Field' ) }
						valueKey="langSlug"
						valueLink={ this.updateLanguage() } />
				</FormFieldset>

				{ this.communityTranslator() }

				{ this.renderHolidaySnow() }

				<FormButton
					isSubmitting={ this.state.submittingForm }
					disabled={ ! this.props.userSettings.hasUnsavedSettings() || this.getDisabledState() || !! this.hadFormError() }
					onClick={ this.recordClickEvent( 'Save Account Settings Button' ) } >
					{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Account Settings' ) }
				</FormButton>
			</div>
		);
	},

	renderBlogActionFields: function() {
		var actions = this.props.username.getAllowedActions();

		/*
		 * If there are no actions or if there is only one action,
		 * which we assume is the 'none' action, we ignore the actions.
		 */
		if ( _size( actions ) <= 1 ) {
			return;
		}

		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'Would you like a matching blog address too?' ) }</FormLegend>
				{
					// message is translated in the API
					_map( actions, function( message, key ) {
						return (
							<FormLabel>
								<FormRadio
									name="usernameAction"
									onChange={ this.handleRadioChange }
									onClick={ this.recordRadioEvent( 'Username Change Blog Action' ) }
									value={ key }
									checked={ key === this.state.usernameAction }
									key={ key } />
								<span>{ message }</span>
							</FormLabel>
						);
					}, this )
				}
			</FormFieldset>
		);
	},

	/*
	 * These form fields are displayed when a username change is in progress.
	 */
	renderUsernameFields: function() {
		return (
			<div className="account__username-form" key="usernameForm">
				<FormFieldset>
					<FormLabel htmlFor="username_confirm">
						{ this.translate( 'Confirm Username', { context: 'User is being prompted to re-enter a string for verification.' } ) }
					</FormLabel>
					<FormTextInput
						id="username_confirm"
						name="username_confirm"
						onFocus={ this.recordFocusEvent( 'Username Confirm Field' ) }
						valueLink={ this.linkState( 'userLoginConfirm' ) } />
					{ this.renderUsernameConfirmNotice() }
					<FormSettingExplanation>{ this.translate( 'Confirm new username' ) }</FormSettingExplanation>
				</FormFieldset>

				{ this.renderBlogActionFields() }

				<FormSectionHeading>{ this.translate( 'Please Read Carefully' ) }</FormSectionHeading>

				<p>
					{ this.translate(
						'You are about to change your username, which is currently {{strong}}%(username)s{{/strong}}. ' +
						'You will not be able to change your username back.',
						{
							args: {
								username: user.get().username
							},
							components: {
								strong: <strong />
							}
						}
					) }
				</p>

				<p>
					{ this.translate(
						'If you just want to change your display name, which is currently {{strong}}%(displayName)s{{/strong}}, ' +
						'you can do so under {{myProfileLink}}My Profile{{/myProfileLink}}.',
						{
							args: {
								displayName: user.get().display_name
							},
							components: {
								myProfileLink: <a href="/me" onClick={ this.recordClickEvent( 'My Profile Link in Username Change', this.markSaved ) } />,
								strong: <strong />
							}
						}
					) }
				</p>

				<p>{ this.translate( 'Changing your username will also affect your Gravatar profile and IntenseDebate profile addresses.' ) }</p>

				<p>{ this.translate( 'If you would still like to change your username, please save your changes. Otherwise, hit the cancel button below.' ) }</p>

				<FormButtonsBar>
					<FormButton
						disabled={ ( this.props.userSettings.getSetting( 'user_login' ) !== this.state.userLoginConfirm ) || ! this.props.username.isUsernameValid() || this.state.submittingForm }
						type="button"
						onClick={ this.recordClickEvent( 'Change Username Button', this.submitUsernameForm ) }
					>
						{ this.translate( 'Save Username' ) }
					</FormButton>

					<FormButton
						isPrimary={ false }
						type="button"
						onClick={ this.recordClickEvent( 'Cancel Username Change Button', this.cancelUsernameChange ) }
					>
						{ this.translate( 'Cancel' ) }
					</FormButton>
				</FormButtonsBar>
			</div>
		);
	},

	render: function() {
		// Is a username change in progress?
		var renderUsernameForm = this.props.userSettings.isSettingUnsaved( 'user_login' );

		return (
			<Main className="account">
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card className="account__settings">
					<form onChange={ this.markChanged } onSubmit={ this.submitForm } >
						<FormFieldset>
							<FormLabel htmlFor="username">{ this.translate( 'Username' ) }</FormLabel>
								<FormTextInput
									autoComplete="off"
									className="account__username"
									disabled={ this.getDisabledState() || ! this.props.userSettings.getSetting( 'user_login_can_be_changed' ) }
									id="username"
									name="username"
									onFocus={ this.recordFocusEvent( 'Username Field' ) }
									onChange={ this.handleUsernameChange }
									value={ this.props.userSettings.getSetting( 'user_login' ) } />
								{ this.renderUsernameValidation() }
								<FormSettingExplanation>{ this.renderJoinDate() }</FormSettingExplanation>
						</FormFieldset>

						{ /* This is how we animate showing/hiding the form field sections */ }
						<ReactCSSTransitionGroup transitionName="account__username-form-toggle">
							{ renderUsernameForm ? this.renderUsernameFields() : this.renderAccountFields() }
						</ReactCSSTransitionGroup>
					</form>
				</Card>
				<SectionHeader label={ this.translate( 'Privacy' ) } />
				<Card>
					<p>{ this.translate( "We use some third party tools to collect data about how users interact with our site. You can find more information about how we use these tools in our privacy policy. If you'd prefer that we not track your interactions you may opt out by using the following link: " ) }</p>
					<p>
						<a href="https://www.inspectlet.com/optout" target="_blank" onClick={ this.recordClickEvent( 'Inspectlet Opt-out Link' ) }>
							{ this.getOptoutText( 'Inspectlet.com' ) }
						</a>
					</p>
				</Card>
			</Main>
		);
	}
} );
