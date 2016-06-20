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
import groupBy from 'lodash/groupBy';
import filter from 'lodash/filter';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';

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
import analytics from 'lib/analytics';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import EmptyContent from 'components/empty-content';
import { userCan } from 'lib/site/utils';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';

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
			errorToDisplay: false,
			errors: {},
			success: []
		} );
	},

	refreshFormState() {
		const sendInvitesSuccess = InvitesSentStore.getSuccess( this.state.formId );

		if ( sendInvitesSuccess ) {
			this.setState( this.resetState() );
			analytics.tracks.recordEvent( 'calypso_invite_people_form_refresh_initial' );
			debug( 'Submit successful. Resetting form.' );
		} else {
			const sendInvitesErrored = InvitesSentStore.getErrors( this.state.formId );
			const errors = get( sendInvitesErrored, 'errors', {} );

			let updatedState = { sendingInvites: false };
			if ( ! isEmpty( errors ) && 'object' === typeof errors ) {
				const errorKeys = Object.keys( errors );
				Object.assign( updatedState, {
					usernamesOrEmails: errorKeys,
					errorToDisplay: errorKeys[0],
					errors,
				} );
			}

			debug( 'Submit errored. Updating state to:  ' + JSON.stringify( updatedState ) );

			this.setState( updatedState );
			analytics.tracks.recordEvent( 'calypso_invite_people_form_refresh_retry' );
		}
	},

	onTokensChange( tokens ) {
		const { role, errorToDisplay, usernamesOrEmails, errors, success } = this.state;
		const filteredTokens = tokens.map( value => {
			if ( 'object' === typeof value ) {
				return value.value;
			}
			return value;
		} );

		const filteredErrors = pickBy( errors, ( error, key ) => {
			return includes( filteredTokens, key );
		} );

		const filteredSuccess = filter( success, ( successfulValidation ) => {
			return includes( filteredTokens, successfulValidation );
		} );

		this.setState( {
			usernamesOrEmails: filteredTokens,
			errors: filteredErrors,
			success: filteredSuccess,
			errorToDisplay: includes( filteredTokens, errorToDisplay ) && errorToDisplay
		} );
		createInviteValidation( this.props.site.ID, filteredTokens, role );

		if ( filteredTokens.length > usernamesOrEmails.length ) {
			analytics.tracks.recordEvent( 'calypso_invite_people_token_added' );
		} else {
			analytics.tracks.recordEvent( 'calypso_invite_people_token_removed' );
		}
	},

	onMessageChange( event ) {
		this.setState( { message: event.target.value } );
	},

	onRoleChange( event ) {
		const role = event.target.value;
		this.setState( { role } );
		createInviteValidation( this.props.site.ID, this.state.usernamesOrEmails, role );
	},

	onFocusTokenField() {
		analytics.tracks.recordEvent( 'calypso_invite_people_token_field_focus' );
	},

	onFocusRoleSelect() {
		analytics.tracks.recordEvent( 'calypso_invite_people_role_select_focus' );
	},

	onFocusCustomMessage() {
		analytics.tracks.recordEvent( 'calypso_invite_people_custom_message_focus' );
	},

	onClickSendInvites() {
		analytics.tracks.recordEvent( 'calypso_invite_people_send_invite_button_click' );
	},

	onClickRoleExplanation() {
		analytics.tracks.recordEvent( 'calypso_invite_people_role_explanation_link_click' );
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

		if ( errorsKeys.length ) {
			analytics.tracks.recordEvent( 'calypso_invite_people_validation_refreshed_with_error' );
		}
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

		if ( this.isSubmitDisabled() ) {
			return false;
		}

		const formId = uniqueId();
		const { usernamesOrEmails, message, role } = this.state;

		this.setState( { sendingInvites: true, formId } );
		this.props.sendInvites(
			this.props.site.ID,
			usernamesOrEmails,
			role,
			message,
			formId
		);

		const groupedInvitees = groupBy( usernamesOrEmails, ( invitee ) => {
			return includes( invitee, '@' ) ? 'email' : 'username';
		} );

		analytics.tracks.recordEvent( 'calypso_invite_people_form_submit', {
			role,
			numberInvitees: usernamesOrEmails.length,
			numberUsernameInvitees: groupedInvitees.username ? groupedInvitees.username.length : 0,
			numberEmailInvitees: groupedInvitees.email ? groupedInvitees.email.length : 0,
			hasCustomMessage: 'string' === typeof message && !! message.length,
		} );
	},

	isSubmitDisabled() {
		const { success, usernamesOrEmails } = this.state;
		const invitees = Array.isArray( usernamesOrEmails ) ? usernamesOrEmails : [];

		// If there are no invitees, then don't allow submitting the form
		if ( this.state.sendingInvites || ! invitees.length ) {
			return true;
		}

		if ( this.hasValidationErrors() ) {
			return true;
		}

		// If there are invitees, and there are no errors, let's check
		// if there are any pending validations.
		return some( usernamesOrEmails, ( value ) => {
			return ! includes( success, value );
		} );
	},

	hasValidationErrors() {
		const { errors } = this.state;
		const errorKeys = errors && Object.keys( errors );

		return !! errorKeys.length;
	},

	goBack() {
		const siteSlug = get( this.props, 'site.slug' );
		const fallback = siteSlug ? ( '/people/team/' + siteSlug ) : '/people/team';

		// Go back to last route with /people/team/$site as the fallback
		page.back( fallback );
	},

	renderRoleExplanation() {
		return (
			<a target="_blank" href="http://en.support.wordpress.com/user-roles/" onClick={ this.onClickRoleExplanation }>
				{ this.translate( 'Learn more about roles' ) }
			</a>
		);
	},

	render() {
		const { site } = this.props;
		if ( site && ! userCan( 'promote_users', site ) ) {
			return (
				<Main>
					<SidebarNavigation />
					<EmptyContent
						title={ this.translate( 'Oops, only administrators can invite other people' ) }
						illustration={ '/calypso/images/drake/drake-empty-results.svg' }
					/>
				</Main>
			);
		}

		return (
			<Main>
				<SidebarNavigation />
				<HeaderCake isCompact onClick={ this.goBack }>
					{ this.translate( 'Invite People' ) }
				</HeaderCake>
				<Card>
					<EmailVerificationGate>
						<form onSubmit={ this.submitForm } >
							<FormFieldset>
								<FormLabel>{ this.translate( 'Usernames or Emails' ) }</FormLabel>
								<TokenField
									isBorderless
									tokenizeOnSpace
									maxLength={ 10 }
									value={ this.getTokensWithStatus() }
									onChange={ this.onTokensChange }
									onFocus={ this.onFocusTokenField }
									disabled={ this.state.sendingInvites }/>
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
								key={ this.props.site.ID }
								includeFollower
								siteId={ this.props.site.ID }
								onChange={ this.onRoleChange }
								onFocus={ this.onFocusRoleSelect }
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
									onFocus={ this.onFocusCustomMessage }
									value={ this.state.message }
									disabled={ this.state.sendingInvites } />
								<FormSettingExplanation>
									{ this.translate(
										'(Optional) You can enter a custom message of up to 500 characters that will be included in the invitation to the user(s).'
									) }
								</FormSettingExplanation>
							</FormFieldset>

							<FormButton disabled={ this.isSubmitDisabled() } onClick={ this.onClickSendInvites } >
								{ this.translate(
									'Send Invitation',
									'Send Invitations', {
										count: this.state.usernamesOrEmails.length || 1,
										context: 'Button label'
									}
								) }
							</FormButton>
						</form>
					</EmailVerificationGate>
				</Card>
			</Main>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { sendInvites }, dispatch )
)( InvitePeople );
