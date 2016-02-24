/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import get from 'lodash/get';
import debugModule from 'debug';
import includes from 'lodash/includes';
import some from 'lodash/some';

/**
 * Internal dependencies
 */
import RoleSelect from 'my-sites/people/role-select';
import TokenField from 'components/token-field';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { sendInvites } from 'lib/invites/actions';
import Card from 'components/card';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import CountedTextarea from 'components/forms/counted-textarea';
import { createInviteValidation } from 'lib/invites/actions';
import InvitesCreateValidationStore from 'lib/invites/stores/invites-create-validation';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:people:invite' );

export default React.createClass( {
	displayName: 'InvitePeople',

	componentDidMount() {
		InvitesCreateValidationStore.on( 'change', this.refreshValidation );
	},

	componentWillUnmount() {
		InvitesCreateValidationStore.off( 'change', this.refreshValidation );
	},

	componentWillReceiveProps() {
		this.setState( this.resetState() );
	},

	getInitialState() {
		return this.resetState();
	},

	resetState() {
		return ( {
			usernamesOrEmails: [],
			role: 'follower',
			message: '',
			response: false,
			sendingInvites: false,
			getTokenStatus: () => {}
		} );
	},

	onTokensChange( tokens ) {
		const { role } = this.state;
		const filteredTokens = tokens.map( ( value ) => {
			if ( 'object' === typeof value ) {
				return value.value;
			}
			return value;
		} );

		this.setState( { usernamesOrEmails: filteredTokens } );
		createInviteValidation( this.props.site.ID, filteredTokens, role );
	},

	onMessageChange( event ) {
		this.setState( { message: event.target.value } );
	},

	onRoleChange( event ) {
		const role = event.target.value;
		this.setState( { role } );
		createInviteValidation( this.props.site.ID, this.state.usernamesOrEmails, role );
	},

	refreshValidation() {
		const errors = InvitesCreateValidationStore.getErrors( this.props.site.ID, this.state.role ) || [];
		let success = InvitesCreateValidationStore.getSuccess( this.props.site.ID, this.state.role ) || [];

		this.setState( {
			errors,
			success
		} );
	},

	getTokensWithStatus() {
		const { success, errors } = this.state;

		const tokens = this.state.usernamesOrEmails.map( ( value ) => {
			let status;
			if ( errors && errors[ value ] ) {
				status = 'error';
			} else if ( ! includes( success, value ) ) {
				status = 'validating';
			}

			if ( status ) {
				value = {
					value,
					status
				};
			}

			return value;
		} );

		debug( 'Generated tokens: ' + JSON.stringify( tokens ) );
		return tokens;
	},

	submitForm( event ) {
		event.preventDefault();
		debug( 'Submitting invite form. State: ' + JSON.stringify( this.state ) );

		this.setState( { sendingInvites: true } );
		sendInvites( this.props.site.ID, this.state.usernamesOrEmails, this.state.role, this.state.message, ( error, data ) => {
			if ( error ) {
				debug( 'Send invite error:' + JSON.stringify( error ) );
			} else {
				debug( 'Send invites response: ' + JSON.stringify( data ) );
			}

			this.setState( {
				sendingInvites: false,
				response: error ? error : data
			} );
		} );
	},

	isSubmitDisabled() {
		const { errors, success, usernamesOrEmails } = this.state;
		const invitees = Array.isArray( usernamesOrEmails ) ? usernamesOrEmails : [];

		// If there are no invitees, then don't allow submitting the form
		if ( this.state.sendingInvites || ! invitees.length ) {
			return true;
		}

		if ( errors && errors.length ) {
			return true;
		}

		// If there are invitees, and there are no errors, let's check
		// if there are any pending validations.
		return some( usernamesOrEmails, ( value ) => {
			return ! includes( success, value );
		} );
	},

	goBack() {
		const siteSlug = get( this.props, 'site.slug' );
		const fallback = siteSlug ? ( '/people/team/' + siteSlug ) : '/people/team';

		// Go back to last route with /people/team/$site as the fallback
		page.back( fallback );
	},

	renderRoleExplanation() {
		return (
			<a target="_blank" href="http://en.support.wordpress.com/user-roles/">
				{ this.translate( 'Learn more about roles' ) }
			</a>
		);
	},

	render() {
		return (
			<Main>
				<HeaderCake isCompact onClick={ this.goBack }/>
				<Card>
					<form onSubmit={ this.submitForm } >
						<FormFieldset>
							<FormLabel>{ this.translate( 'Usernames or Emails' ) }</FormLabel>
							<TokenField
								isBorderless
								value={ this.getTokensWithStatus() }
								onChange={ this.onTokensChange } />
							<FormSettingExplanation>
								{ this.translate(
									'Invite up to 10 email addresses and/or WordPress.com usernames. ' +
									'Those needing a username will be sent instructions on how to create one.'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<RoleSelect
							id="role"
							name="role"
							key="role"
							includeFollower
							siteId={ this.props.site.ID }
							onChange={ this.onRoleChange }
							value={ this.state.role }
							disabled={ this.state.sendingInvites }
							explanation={ this.renderRoleExplanation() }
							/>

						<FormFieldset>
							<FormLabel htmlFor="message">{ this.translate( 'Custom Message' ) }</FormLabel>
							<CountedTextarea
								name="message"
								id="message"
								showRemainingCharacters
								maxLength={ 500 }
								acceptableLength={ 500 }
								onChange={ this.onMessageChange }
								value={ this.state.message }
								disabled={ this.state.sendingInvites } />
							<FormSettingExplanation>
								{ this.translate(
									'(Optional) You can enter a custom message of up to 500 characters that will be included in the invitation to the user(s).'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormButton disabled={ this.isSubmitDisabled() }>
							{ this.translate(
								'Send Invitation',
								'Send Invitations', {
									count: this.state.usernamesOrEmails.length || 1,
									context: 'Button label'
								}
							) }
						</FormButton>
					</form>
				</Card>
			</Main>
		);
	}
} );
