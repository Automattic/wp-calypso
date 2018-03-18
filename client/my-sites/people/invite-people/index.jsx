/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import { filter, get, groupBy, includes, isEmpty, pickBy, some, uniqueId } from 'lodash';
import debugModule from 'debug';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

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
import { getSelectedSiteId } from 'state/ui/selectors';
import FeatureExample from 'components/feature-example';
import versionCompare from 'lib/version-compare';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { isJetpackSite } from 'state/sites/selectors';
import { activateModule } from 'state/jetpack/modules/actions';
import { isActivatingJetpackModule, isJetpackModuleActive } from 'state/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:people:invite' );

class InvitePeople extends React.Component {
	static displayName = 'InvitePeople';

	componentDidMount() {
		InvitesCreateValidationStore.on( 'change', this.refreshValidation );
		InvitesSentStore.on( 'change', this.refreshFormState );
	}

	componentWillUnmount() {
		InvitesCreateValidationStore.off( 'change', this.refreshValidation );
		InvitesSentStore.off( 'change', this.refreshFormState );
	}

	componentWillReceiveProps() {
		this.setState( this.resetState() );
	}

	resetState = () => {
		return {
			usernamesOrEmails: [],
			role: 'follower',
			message: '',
			sendingInvites: false,
			getTokenStatus: () => {},
			errorToDisplay: false,
			errors: {},
			success: [],
		};
	};

	refreshFormState = () => {
		const sendInvitesSuccess = InvitesSentStore.getSuccess( this.state.formId );

		if ( sendInvitesSuccess ) {
			this.setState( this.resetState() );
			analytics.tracks.recordEvent( 'calypso_invite_people_form_refresh_initial' );
			debug( 'Submit successful. Resetting form.' );
		} else {
			const sendInvitesErrored = InvitesSentStore.getErrors( this.state.formId ),
				errors = get( sendInvitesErrored, 'errors', {} ),
				updatedState = { sendingInvites: false };
			if ( ! isEmpty( errors ) && 'object' === typeof errors ) {
				const errorKeys = Object.keys( errors );
				Object.assign( updatedState, {
					usernamesOrEmails: errorKeys,
					errorToDisplay: errorKeys[ 0 ],
					errors,
				} );
			}

			debug( 'Submit errored. Updating state to:  ' + JSON.stringify( updatedState ) );

			this.setState( updatedState );
			analytics.tracks.recordEvent( 'calypso_invite_people_form_refresh_retry' );
		}
	};

	onTokensChange = tokens => {
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

		const filteredSuccess = filter( success, successfulValidation => {
			return includes( filteredTokens, successfulValidation );
		} );

		this.setState( {
			usernamesOrEmails: filteredTokens,
			errors: filteredErrors,
			success: filteredSuccess,
			errorToDisplay: includes( filteredTokens, errorToDisplay ) && errorToDisplay,
		} );
		createInviteValidation( this.props.siteId, filteredTokens, role );

		if ( filteredTokens.length > usernamesOrEmails.length ) {
			analytics.tracks.recordEvent( 'calypso_invite_people_token_added' );
		} else {
			analytics.tracks.recordEvent( 'calypso_invite_people_token_removed' );
		}
	};

	onMessageChange = event => {
		this.setState( { message: event.target.value } );
	};

	onRoleChange = event => {
		const role = event.target.value;
		this.setState( { role } );
		createInviteValidation( this.props.siteId, this.state.usernamesOrEmails, role );
	};

	onFocusTokenField = () => {
		analytics.tracks.recordEvent( 'calypso_invite_people_token_field_focus' );
	};

	onFocusRoleSelect = () => {
		analytics.tracks.recordEvent( 'calypso_invite_people_role_select_focus' );
	};

	onFocusCustomMessage = () => {
		analytics.tracks.recordEvent( 'calypso_invite_people_custom_message_focus' );
	};

	onClickSendInvites = () => {
		analytics.tracks.recordEvent( 'calypso_invite_people_send_invite_button_click' );
	};

	onClickRoleExplanation = () => {
		analytics.tracks.recordEvent( 'calypso_invite_people_role_explanation_link_click' );
	};

	refreshValidation = () => {
		const errors =
				InvitesCreateValidationStore.getErrors( this.props.siteId, this.state.role ) || {},
			success = InvitesCreateValidationStore.getSuccess( this.props.siteId, this.state.role ) || [],
			errorsKeys = Object.keys( errors ),
			errorToDisplay = this.state.errorToDisplay || ( errorsKeys.length > 0 && errorsKeys[ 0 ] );

		this.setState( {
			errorToDisplay,
			errors,
			success,
		} );

		if ( errorsKeys.length ) {
			analytics.tracks.recordEvent( 'calypso_invite_people_validation_refreshed_with_error' );
		}
	};

	getTooltip = value => {
		const { errors, errorToDisplay } = this.state;
		if ( errorToDisplay && value !== errorToDisplay ) {
			return null;
		}
		return get( errors, [ value, 'message' ] );
	};

	getTokensWithStatus = () => {
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
					status: 'validating',
				};
			}
			return value;
		} );

		debug( 'Generated tokens: ' + JSON.stringify( tokens ) );
		return tokens;
	};

	submitForm = event => {
		event.preventDefault();
		debug( 'Submitting invite form. State: ' + JSON.stringify( this.state ) );

		if ( this.isSubmitDisabled() ) {
			return false;
		}

		const formId = uniqueId();
		const { usernamesOrEmails, message, role } = this.state;

		this.setState( { sendingInvites: true, formId } );
		this.props.sendInvites( this.props.siteId, usernamesOrEmails, role, message, formId );

		const groupedInvitees = groupBy( usernamesOrEmails, invitee => {
			return includes( invitee, '@' ) ? 'email' : 'username';
		} );

		analytics.tracks.recordEvent( 'calypso_invite_people_form_submit', {
			role,
			number_invitees: usernamesOrEmails.length,
			number_username_invitees: groupedInvitees.username ? groupedInvitees.username.length : 0,
			number_email_invitees: groupedInvitees.email ? groupedInvitees.email.length : 0,
			has_custom_message: 'string' === typeof message && !! message.length,
		} );
	};

	isSubmitDisabled = () => {
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
		return some( usernamesOrEmails, value => {
			return ! includes( success, value );
		} );
	};

	hasValidationErrors = () => {
		const { errors } = this.state;
		const errorKeys = errors && Object.keys( errors );

		return !! errorKeys.length;
	};

	goBack = () => {
		const siteSlug = get( this.props, 'site.slug' );
		const fallback = siteSlug ? '/people/team/' + siteSlug : '/people/team';

		// Go back to last route with /people/team/$site as the fallback
		page.back( fallback );
	};

	renderRoleExplanation = () => {
		const { translate } = this.props;
		return (
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="http://en.support.wordpress.com/user-roles/"
				onClick={ this.onClickRoleExplanation }
			>
				{ translate( 'Learn more about roles' ) }
			</a>
		);
	};

	enableSSO = () => {
		this.props.activateModule( this.props.siteId, 'sso' );
	};

	renderInviteForm = () => {
		const { site, translate, needsVerification, isJetpack, showSSONotice } = this.props;

		const inviteForm = (
			<Card>
				<EmailVerificationGate>
					<form onSubmit={ this.submitForm }>
						<div role="group" className="invite-people__token-field-wrapper">
							<FormLabel htmlFor="usernamesOrEmails">
								{ translate( 'Usernames or Emails' ) }
							</FormLabel>
							<TokenField
								id="usernamesOrEmails"
								isBorderless
								tokenizeOnSpace
								autoCapitalize="none"
								autoComplete="off"
								autoCorrect="off"
								spellCheck="false"
								maxLength={ 10 }
								value={ this.getTokensWithStatus() }
								onChange={ this.onTokensChange }
								onFocus={ this.onFocusTokenField }
								disabled={ this.state.sendingInvites }
							/>
							<FormSettingExplanation>
								{ translate(
									'Want to invite new users to your site? The more the merrier! ' +
										'Invite as many as you want, up to 10 at a time, by adding ' +
										'their email addresses or WordPress.com usernames.'
								) }
							</FormSettingExplanation>
						</div>

						<RoleSelect
							id="role"
							name="role"
							includeFollower
							siteId={ this.props.siteId }
							onChange={ this.onRoleChange }
							onFocus={ this.onFocusRoleSelect }
							value={ this.state.role }
							disabled={ this.state.sendingInvites }
							explanation={ this.renderRoleExplanation() }
						/>

						<FormFieldset>
							<FormLabel htmlFor="message">{ translate( 'Custom Message' ) }</FormLabel>
							<CountedTextarea
								name="message"
								id="message"
								showRemainingCharacters
								maxLength={ 500 }
								acceptableLength={ 500 }
								onChange={ this.onMessageChange }
								onFocus={ this.onFocusCustomMessage }
								value={ this.state.message }
								disabled={ this.state.sendingInvites }
							/>
							<FormSettingExplanation>
								{ translate(
									'(Optional) You can enter a custom message of up to 500 characters ' +
										'that will be included in the invitation to the user(s).'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormButton disabled={ this.isSubmitDisabled() } onClick={ this.onClickSendInvites }>
							{ translate( 'Send Invitation', 'Send Invitations', {
								count: this.state.usernamesOrEmails.length || 1,
								context: 'Button label',
							} ) }
						</FormButton>
					</form>
				</EmailVerificationGate>
			</Card>
		);

		// Return early for WPCOM or needs verification
		if ( ! site || ! isJetpack || needsVerification ) {
			return inviteForm;
		}

		const jetpackVersion = get( site, 'options.jetpack_version', 0 );
		if ( ! this.props.isSiteAutomatedTransfer && versionCompare( jetpackVersion, '5.0', '<' ) ) {
			return (
				<div className="invite-people__action-required">
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Inviting users requires Jetpack 5.0 or higher' ) }
					>
						<NoticeAction href={ `/plugins/jetpack/${ site.slug }` }>
							{ translate( 'Update' ) }
						</NoticeAction>
					</Notice>
					<FeatureExample>{ inviteForm }</FeatureExample>
				</div>
			);
		} else if ( showSSONotice ) {
			return (
				<div className="invite-people__action-required">
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Inviting users requires WordPress.com sign in' ) }
					>
						<NoticeAction onClick={ this.enableSSO }>{ translate( 'Enable' ) }</NoticeAction>
					</Notice>
					<FeatureExample>{ inviteForm }</FeatureExample>
				</div>
			);
		}

		return inviteForm;
	};

	state = this.resetState();

	render() {
		const { site, translate } = this.props;
		if ( site && ! userCan( 'promote_users', site ) ) {
			return (
				<Main>
					<SidebarNavigation />
					<EmptyContent
						title={ translate( 'Oops, only administrators can invite other people' ) }
						illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
					/>
				</Main>
			);
		}

		return (
			<Main className="invite-people">
				<SidebarNavigation />
				<HeaderCake isCompact onClick={ this.goBack }>
					{ translate( 'Invite People' ) }
				</HeaderCake>
				{ this.renderInviteForm() }
			</Main>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const activating = isActivatingJetpackModule( state, siteId, 'sso' );
		const active = isJetpackModuleActive( state, siteId, 'sso' );

		return {
			siteId,
			needsVerification: ! isCurrentUserEmailVerified( state ),
			showSSONotice: !! ( activating || active ),
			isJetpack: isJetpackSite( state, siteId ),
			isSiteAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
		};
	},
	dispatch => bindActionCreators( { sendInvites, activateModule }, dispatch )
)( localize( InvitePeople ) );
