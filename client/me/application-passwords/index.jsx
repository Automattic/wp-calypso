/**
 * External dependencies
 */
var React = require( 'react' ),
	LinkedStateMixin = require( 'react-addons-linked-state-mixin' ),
	debug = require( 'debug' )( 'calypso:application-passwords' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect;

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	AppPasswordItem = require( 'me/application-password-item' ),
	notices = require( 'notices' ),
	SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	eventRecorder = require( 'me/event-recorder' ),
	Card = require( 'components/card' ),
	classNames = require( 'classnames' ),
	errorNotice = require( 'state/notices/actions' ).errorNotice;

const ApplicationPasswords = React.createClass( {

	displayName: 'ApplicationPasswords',

	mixins: [ observe( 'appPasswordsData' ), LinkedStateMixin, eventRecorder ],

	componentDidMount: function() {
		debug( this.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.displayName + ' React component is unmounting.' );
	},

	getInitialState: function() {
		return {
			applicationName: '',
			addingPassword: false,
			submittingForm: false
		};
	},

	createApplicationPassword: function( event ) {
		event.preventDefault();
		this.setState( { submittingForm: true } );

		this.props.appPasswordsData.create(
			this.state.applicationName,
			function( error ) {
				this.setState( { submittingForm: false } );
				if ( error ) {
					debug( 'Failure creating application password.' );

					// handle error case here
					notices.clearNotices( 'notices' );
					this.props.errorNotice( this.translate( 'There was a problem creating your application password. Please try again.' ) );
				} else {
					debug( 'Application password created successfully.' );
				}
			}.bind( this )
		);
	},

	clearNewApplicationPassword: function() {
		this.props.appPasswordsData.clearNewPassword();
		this.setState( this.getInitialState() );
	},

	toggleNewPassword: function( e ) {
		e.preventDefault();
		this.setState( { addingPassword: ! this.state.addingPassword } );
	},

	renderNewAppPasswordForm: function() {
		const cardClasses = classNames( 'application-passwords__add-new-card', { 'is-visible': this.state.addingPassword } );

			return (
				<Card className={ cardClasses }>
					<form
						id="add-application-password"
						className="application-passwords__add-new"
						onSubmit={ this.createApplicationPassword } >

						<FormFieldset>
							<FormLabel htmlFor="application-name">{ this.translate( 'Application Name' ) }</FormLabel>
							<FormTextInput
								className="application-passwords__add-new-field"
								disabled={ this.state.submittingForm }
								id="application-name"
								name="application-name"
								onFocus={ this.recordFocusEvent( 'Application Name Field' ) }
								valueLink={ this.linkState( 'applicationName' ) } />
						</FormFieldset>

						<FormButtonsBar>
							<FormButton
								disabled={ this.state.submittingForm || '' === this.state.applicationName }
								onClick={ this.recordClickEvent( 'Generate New Application Password Button' ) } >
								{ this.state.submittingForm ? this.translate( 'Generating Password…' ) : this.translate( 'Generate Password' ) }
							</FormButton>
							{  this.props.appPasswordsData.get().length ?
								<FormButton
									isPrimary={ false }
									onClick={ this.recordClickEvent( 'Cancel Generate New Application Password Button', this.toggleNewPassword ) }
								>
									{ this.translate( 'Cancel' ) }
								</FormButton> :
								null
							}
						</FormButtonsBar>
					</form>
			</Card>
			);
	},

	renderNewAppPassword: function() {
		var newPassword = this.props.appPasswordsData.newApplicationPassword;
		return (
			<Card className="application-passwords__new-password">
				<p className="application-passwords__new-password-display">
					{ newPassword.application_password }
				</p>

				<p className="application-passwords__new-password-help">
					{
						this.translate(
							'Use this password to log in to {{strong}}%(appName)s{{/strong}}. Note: spaces are ignored.', {
							args: {
								appName: this.state.applicationName
							},
							components: {
								strong: <strong/>
							}
						} )
					}
				</p>

				<FormButtonsBar>
					<FormButton onClick={ this.recordClickEvent( 'New Application Password Done Button', this.clearNewApplicationPassword ) } >
						{ this.translate( 'Done' ) }
					</FormButton>
				</FormButtonsBar>
			</Card>
		);
	},

	renderApplicationPasswords: function() {
		if ( ! this.props.appPasswordsData.get().length ) {
			return null;
		}

		return (
			<div className="application-passwords__active">
				<FormSectionHeading>{ this.translate( 'Active Passwords' ) }</FormSectionHeading>
				<ul className="application-passwords__list">
					{
						this.props.appPasswordsData.get().map( function( password ) {
							return (
								<AppPasswordItem password={ password } appPasswordsData={ this.props.appPasswordsData } key={ password.ID } />
							);
						}, this )
					}
				</ul>
			</div>
		);
	},

	render: function() {
		var hasNewPassword = this.props.appPasswordsData.hasNewPassword();

		return (
			<div>
				<SectionHeader label={ this.translate( 'Application Passwords' ) }>
					<Button compact onClick={ this.recordClickEvent( 'Create Application Password Button', this.toggleNewPassword ) }>
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						<Gridicon icon="plus-small" size={ 16 } />
						{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
						{ this.translate( 'Add New Application Password' ) }
					</Button>
				</SectionHeader>
				<Card>

					{ hasNewPassword
					 	? this.renderNewAppPassword()
						: this.renderNewAppPasswordForm() }

					<p>
						{
							this.translate(
								'With Two-Step Authentication active, you can generate a custom password for ' +
								'each third-party application you authorize to use your WordPress.com account. ' +
								'You can revoke access for an individual application here if you ever need to.'
							)
						}
					</p>

					{ this.renderApplicationPasswords() }

				</Card>
			</div>

		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { errorNotice }, dispatch )
)( ApplicationPasswords );
