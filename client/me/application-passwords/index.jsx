/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';
import observe from 'lib/mixins/data-observe';
import AppPasswordItem from 'me/application-password-item';
import eventRecorder from 'me/event-recorder';
import notices from 'notices';
import { errorNotice } from 'state/notices/actions';

const debug = debugFactory( 'calypso:application-passwords' );

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
					this.props.errorNotice( this.props.translate( 'There was a problem creating your application password. Please try again.' ) );
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
						<FormLabel htmlFor="application-name">{ this.props.translate( 'Application Name' ) }</FormLabel>
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
							{ this.state.submittingForm ? this.props.translate( 'Generating Password…' ) : this.props.translate( 'Generate Password' ) }
						</FormButton>
						{ this.props.appPasswordsData.get().length ?
							<FormButton
								isPrimary={ false }
								onClick={ this.recordClickEvent( 'Cancel Generate New Application Password Button', this.toggleNewPassword ) }
							>
								{ this.props.translate( 'Cancel' ) }
							</FormButton> :
							null
						}
					</FormButtonsBar>
				</form>
		</Card>
		);
	},

	renderNewAppPassword: function() {
		const newPassword = this.props.appPasswordsData.newApplicationPassword;
		return (
		    <Card className="application-passwords__new-password">
				<p className="application-passwords__new-password-display">
					{ newPassword.application_password }
				</p>

				<p className="application-passwords__new-password-help">
					{
						this.props.translate(
							'Use this password to log in to {{strong}}%(appName)s{{/strong}}. Note: spaces are ignored.', {
								args: {
									appName: this.state.applicationName
								},
								components: {
									strong: <strong />
								}
							} )
					}
				</p>

				<FormButtonsBar>
					<FormButton onClick={ this.recordClickEvent( 'New Application Password Done Button', this.clearNewApplicationPassword ) } >
						{ this.props.translate( 'Done' ) }
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
				<FormSectionHeading>{ this.props.translate( 'Active Passwords' ) }</FormSectionHeading>
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
		const hasNewPassword = this.props.appPasswordsData.hasNewPassword();

		return (
		    <div>
				<SectionHeader label={ this.props.translate( 'Application Passwords' ) }>
					<Button compact onClick={ this.recordClickEvent( 'Create Application Password Button', this.toggleNewPassword ) }>
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						<Gridicon icon="plus-small" size={ 16 } />
						{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
						{ this.props.translate( 'Add New Application Password' ) }
					</Button>
				</SectionHeader>
				<Card>

					{ hasNewPassword
						? this.renderNewAppPassword()
						: this.renderNewAppPasswordForm() }

					<p>
						{
							this.props.translate(
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
)( localize( ApplicationPasswords ) );
