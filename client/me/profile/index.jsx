/**
 * External dependencies
 */
var React = require( 'react' ),
	LinkedStateMixin = require( 'react-addons-linked-state-mixin' ),
	debug = require( 'debug' )( 'calypso:me:profile' );

/**
 * Internal dependencies
 */
var MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	protectForm = require( 'lib/mixins/protect-form' ),
	formBase = require( 'me/form-base' ),
	FormButton = require( 'components/forms/form-button' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	FormTextarea = require( 'components/forms/form-textarea' ),
	ProfileLinks = require( 'me/profile-links' ),
	userProfileLinks = require( 'lib/user-profile-links' ),
	ReauthRequired = require( 'me/reauth-required' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	Card = require( 'components/card' ),
	observe = require( 'lib/mixins/data-observe' ),
	eventRecorder = require( 'me/event-recorder' ),
	Main = require( 'components/main' );

module.exports = React.createClass( {

	displayName: 'Profile',

	mixins: [ formBase, LinkedStateMixin, protectForm.mixin, observe( 'userSettings' ), eventRecorder ],

	componentDidMount: function() {
		debug( this.constructor.displayName + ' component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' component is unmounting.' );
	},

	render: function() {
		var gravatarProfileLink = 'https://gravatar.com/' + this.props.userSettings.getSetting( 'user_login' );

		return (
			<Main className="profile">
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card className="me-profile-settings">
					<p>
						{ this.translate(
							'This information will be displayed publicly on {{profilelink}}your profile{{/profilelink}} and in ' +
							'{{hovercardslink}}Gravatar Hovercards{{/hovercardslink}}.',
							{
								components: {
									profilelink: (
										<a
											onClick={ this.recordClickEvent( 'My Profile Link' ) }
											href={ gravatarProfileLink }
											target="_blank"
										/>
									),
									hovercardslink: (
										<a
											onClick={ this.recordClickEvent( 'Gravatar Hovercards Link' ) }
											href="https://support.wordpress.com/gravatar-hovercards/"
											target="_blank"
										/>
									)
								}
							}
						) }
					</p>

					<form onSubmit={ this.submitForm } onChange={ this.markChanged }>
						<FormFieldset>
							<FormLabel htmlFor="first_name">{ this.translate( 'First Name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="first_name"
								name="first_name"
								onFocus={ this.recordFocusEvent( 'First Name Field' ) }
								valueLink={ this.valueLink( 'first_name' ) } />
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="last_name">{ this.translate( 'Last Name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="last_name"
								name="last_name"
								onFocus={ this.recordFocusEvent( 'Last Name Field' ) }
								valueLink={ this.valueLink( 'last_name' ) } />
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="display_name">{ this.translate( 'Public Display Name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="display_name"
								name="display_name"
								onFocus={ this.recordFocusEvent( 'Display Name Field' ) }
								valueLink={ this.valueLink( 'display_name' ) } />
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="description">{ this.translate( 'About Me' ) }</FormLabel>
							<FormTextarea
								disabled={ this.getDisabledState() }
								id="description"
								name="description"
								onFocus={ this.recordFocusEvent( 'About Me Field' ) }
								valueLink={ this.valueLink( 'description' ) }>
							</FormTextarea>
						</FormFieldset>

						<p>
							<FormButton
								disabled={ ! this.props.userSettings.hasUnsavedSettings() || this.getDisabledState() }
								onClick={ this.recordClickEvent( 'Save Profile Details Button' ) }>
								{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Profile Details' ) }
							</FormButton>
						</p>
					</form>
				</Card>

				<ProfileLinks userProfileLinks={ userProfileLinks } />

			</Main>
		);
	}
} );
