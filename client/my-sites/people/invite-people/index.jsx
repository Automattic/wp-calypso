/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import get from 'lodash/get';
import debugModule from 'debug';
import includes from 'lodash/includes';
import some from 'lodash/some';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uniqueId from 'lodash/uniqueId';

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
import InvitesSentStore from 'lib/invites/stores/invites-sent';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:people:invite' );

const InvitePeople = React.createClass( {
	displayName: 'InvitePeople',

	componentDidMount() {
		InvitesCreateValidationStore.on( 'change', this.refreshValidation );
		InvitesSentStore.on( 'change', this.refreshFormState );
	},

	componentWillUnmount() {
		InvitesCreateValidationStore.off( 'change', this.refreshValidation );
		InvitesSentStore.off( 'change', this.refreshFormState );
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
			sendingInvites: false,
			getTokenStatus: () => {},
			errorToDisplay: false
		} );
	},

	refreshFormState() {
		const sendInvitesSuccess = InvitesSentStore.getSuccess( this.state.formId );

		if ( sendInvitesSuccess ) {
			this.setState( this.resetState() );
		} else {
			this.setState( { sendingInvites: false } );
		}
	},

	onTokensChange( tokens ) {
		const { role, errorToDisplay } = this.state;
		const filteredTokens = tokens.map( value => {
			if ( 'object' === typeof value ) {
				return value.value;
			}
			return value;
		} );

		this.setState( {
			usernamesOrEmails: filteredTokens,
			errorToDisplay: includes( filteredTokens, errorToDisplay ) && errorToDisplay
		} );
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
		const errors = InvitesCreateValidationStore.getErrors( this.props.site.ID, this.state.role ) || {},
			success = InvitesCreateValidationStore.getSuccess( this.props.site.ID, this.state.role ) || [],
			errorsKeys = Object.keys( errors ),
			errorToDisplay = this.state.errorToDisplay || ( errorsKeys.length > 0 && errorsKeys[0] );

		this.setState( {
			errorToDisplay,
			errors,
			success
		} );
	},

	getTooltip( value ) {
		const { errors, errorToDisplay } = this.state;
		if ( errorToDisplay && value !== errorToDisplay ) {
			return null;
		}
		return get( errors, [ value, 'message' ] );
	},

	getTokensWithStatus() {
		const { success, errors } = this.state;

		const tokens = this.state.usernamesOrEmails.map( value => {
			if ( errors && errors[ value ] ) {
				return {
					status: 'error',
					value,
					tooltip: this.getTooltip( value ),
					onMouseEnter: () => this.setState( { errorToDisplay: value } ),
				};
			}
			if ( ! includes( success, value ) ) {
				return {
					value,
					status: 'validating'
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

		const formId = uniqueId();

		this.setState( { sendingInvites: true, formId } );
		this.props.sendInvites(
			this.props.site.ID,
			this.state.usernamesOrEmails,
			this.state.role,
			this.state.message,
			formId
		);
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

export default connect(
	null,
	dispatch => bindActionCreators( { sendInvites }, dispatch )
)( InvitePeople );
