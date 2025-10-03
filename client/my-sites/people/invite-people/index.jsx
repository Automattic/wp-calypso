import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Card, Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import debugModule from 'debug';
import { localize, fixMe } from 'i18n-calypso';
import { filter, get, groupBy, includes, pickBy, some } from 'lodash';
import { createRef, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import EmptyContent from 'calypso/components/empty-content';
import FeatureExample from 'calypso/components/feature-example';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import CountedTextarea from 'calypso/components/forms/counted-textarea';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import SectionHeader from 'calypso/components/section-header';
import TokenField from 'calypso/components/token-field';
import withSiteRoles from 'calypso/data/site-roles/with-site-roles';
import accept from 'calypso/lib/accept';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import getWpcomFollowerRole from 'calypso/lib/get-wpcom-follower-role';
import { userCan } from 'calypso/lib/site/utils';
import wpcom from 'calypso/lib/wp';
import ContractorSelect from 'calypso/my-sites/people/contractor-select';
import P2TeamBanner from 'calypso/my-sites/people/p2-team-banner';
import RoleSelect from 'calypso/my-sites/people/role-select';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { generateInviteLinks, disableInviteLinks } from 'calypso/state/invites/actions';
import { getInviteLinksForSite } from 'calypso/state/invites/selectors';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isEligibleForSubscriberImporter from 'calypso/state/selectors/is-eligible-for-subscriber-importer';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:people:invite' );

class InvitePeople extends Component {
	static displayName = 'InvitePeople';

	componentDidUpdate( prevProps ) {
		if (
			prevProps.needsVerification !== this.props.needsVerification ||
			prevProps.showSSONotice !== this.props.showSSONotice ||
			prevProps.isJetpack !== this.props.isJetpack
		) {
			this.resetState();
		}
	}

	resetState = () => {
		this.setState( this.getInitialState() );
	};

	getInitialState = () => {
		let defaultRole;
		const { isAtomic, isWPForTeamsSite, includeSubscriberImporter } = this.props;

		if ( includeSubscriberImporter ) {
			defaultRole = 'editor';
		} else {
			defaultRole = 'follower';

			if ( isWPForTeamsSite ) {
				defaultRole = 'editor';
			} else if ( isAtomic ) {
				defaultRole = 'subscriber';
			}
		}

		return {
			isExternal: false,
			usernamesOrEmails: [],
			role: defaultRole,
			message: '',
			sendingInvites: false,
			getTokenStatus: () => {},
			errorToDisplay: false,
			errors: {},
			success: [],
			activeInviteLink: false,
			showCopyConfirmation: false,
			isGeneratingInviteLinks: false,
		};
	};

	onFocusTokenField = () =>
		this.props.recordTracksEvent( 'calypso_invite_people_token_field_focus' );

	onFocusRoleSelect = () =>
		this.props.recordTracksEvent( 'calypso_invite_people_role_select_focus' );

	onFocusCustomMessage = () =>
		this.props.recordTracksEvent( 'calypso_invite_people_custom_message_focus' );

	onClickSendInvites = () =>
		this.props.recordTracksEvent( 'calypso_invite_people_send_invite_button_click' );

	onClickRoleExplanation = () =>
		this.props.recordTracksEvent( 'calypso_invite_people_role_explanation_link_click' );

	refreshFormState = ( errors = {}, success = [] ) => {
		const errorKeys = Object.keys( errors );

		if ( success.length && ! errorKeys.length ) {
			this.resetState();
			this.props.recordTracksEvent( 'calypso_invite_people_form_refresh_initial' );
			debug( 'Submit successful. Resetting form.' );
			return;
		}

		if ( errorKeys.length && 'object' === typeof errors ) {
			const updatedState = {
				sendingInvites: false,
				usernamesOrEmails: errorKeys,
				errorToDisplay: errorKeys[ 0 ],
				errors,
			};

			debug( 'Submit errored. Updating state to:  ' + JSON.stringify( updatedState ) );

			this.setState( updatedState );
			this.props.recordTracksEvent( 'calypso_invite_people_form_refresh_retry' );
			return;
		}

		this.setState( { sendingInvites: false } );
	};

	onTokensChange = ( tokens ) => {
		const { role, errorToDisplay, usernamesOrEmails, errors, success } = this.state;
		const filteredTokens = tokens.map( ( value ) => {
			if ( 'object' === typeof value ) {
				return value.value;
			}
			return value;
		} );

		const filteredErrors = pickBy( errors, ( error, key ) => {
			return filteredTokens.includes( key );
		} );

		const filteredSuccess = filter( success, ( successfulValidation ) => {
			return filteredTokens.includes( successfulValidation );
		} );

		this.setState( {
			usernamesOrEmails: filteredTokens,
			errors: filteredErrors,
			success: filteredSuccess,
			errorToDisplay: filteredTokens.includes( errorToDisplay ) && errorToDisplay,
		} );
		this.validateInvitation( this.props.siteId, filteredTokens, role );

		if ( filteredTokens.length > usernamesOrEmails.length ) {
			this.props.recordTracksEvent( 'calypso_invite_people_token_added' );
		} else {
			this.props.recordTracksEvent( 'calypso_invite_people_token_removed' );
		}
	};

	onMessageChange = ( event ) => this.setState( { message: event.target.value } );

	onRoleChange = ( event ) => {
		const role = event.target.value;
		this.setState( { role } );
		this.validateInvitation( this.props.siteId, this.state.usernamesOrEmails, role );
	};

	onExternalChange = ( event ) => {
		const isExternal = event.target.checked;
		this.setState( { isExternal } );
	};

	async validateInvitation( siteId, usernamesOrEmails, role ) {
		try {
			const { success, errors } = await wpcom.req.post( `/sites/${ siteId }/invites/validate`, {
				invitees: usernamesOrEmails,
				role,
			} );

			this.refreshValidation( success, errors );

			this.props.recordTracksEvent( 'calypso_invite_create_validation_success' );
		} catch ( error ) {
			this.props.recordTracksEvent( 'calypso_invite_create_validation_failed' );
		}
	}

	refreshValidation = ( success = [], errors = {} ) => {
		const errorsKeys = Object.keys( errors );
		const errorToDisplay =
			this.state.errorToDisplay || ( errorsKeys.length > 0 && errorsKeys[ 0 ] );

		this.setState( {
			errorToDisplay,
			errors,
			success,
		} );

		if ( errorsKeys.length ) {
			this.props.recordTracksEvent( 'calypso_invite_people_validation_refreshed_with_error' );
		}
	};

	getTooltip = ( value ) => {
		const { errors, errorToDisplay } = this.state;
		if ( errorToDisplay && value !== errorToDisplay ) {
			return null;
		}
		return get( errors, [ value, 'message' ] );
	};

	getTokensWithStatus = () => {
		const { success, errors } = this.state;

		const tokens = this.state.usernamesOrEmails.map( ( value ) => {
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

	async sendInvites( siteId, usernamesOrEmails, role, message, isExternal ) {
		try {
			const response = await wpcom.req.post( `/sites/${ siteId }/invites/new`, {
				invitees: usernamesOrEmails,
				is_external: isExternal,
				role,
				message,
				source: 'calypso',
			} );

			const countValidationErrors = Object.keys( response.errors ).length;

			if ( countValidationErrors ) {
				let errorMessage;

				if ( countValidationErrors === usernamesOrEmails.length ) {
					errorMessage = this.props.translate(
						'Invitation failed to send',
						'Invitations failed to send',
						{
							count: countValidationErrors,
							context: 'Displayed in a notice when all invitations failed to send.',
						}
					);
				} else {
					errorMessage = this.props.translate(
						'An invitation failed to send',
						'Some invitations failed to send',
						{
							count: countValidationErrors,
							context: 'Displayed in a notice when some invitations failed to send.',
						}
					);
				}

				this.props.errorNotice( errorMessage );
				this.props.recordTracksEvent( 'calypso_invite_send_failed' );
			} else {
				this.props.successNotice(
					this.props.translate( 'Invitation sent successfully', 'Invitations sent successfully', {
						count: usernamesOrEmails.length,
					} )
				);
				this.props.recordTracksEvent( 'calypso_invite_send_success', { role } );
			}

			this.refreshFormState( response.errors, response.sent );
		} catch ( error ) {
			this.props.errorNotice(
				this.props.translate(
					"Sorry, we couldn't process your invitations. Please try again later."
				)
			);
			this.props.recordTracksEvent( 'calypso_invite_send_failed' );
			this.setState( { sendingInvites: false } );
		}
	}

	submitForm = ( event ) => {
		event.preventDefault();
		debug( 'Submitting invite form. State: ' + JSON.stringify( this.state ) );

		if ( this.isSubmitDisabled() ) {
			return false;
		}

		const { usernamesOrEmails, message, role, isExternal } = this.state;

		this.setState( { sendingInvites: true } );
		this.sendInvites( this.props.siteId, usernamesOrEmails, role, message, isExternal );

		const groupedInvitees = groupBy( usernamesOrEmails, ( invitee ) => {
			return includes( invitee, '@' ) ? 'email' : 'username';
		} );

		this.props.recordTracksEvent( 'calypso_invite_people_form_submit', {
			role,
			is_external: isExternal,
			number_invitees: usernamesOrEmails.length,
			number_username_invitees: groupedInvitees.username ? groupedInvitees.username.length : 0,
			number_email_invitees: groupedInvitees.email ? groupedInvitees.email.length : 0,
			has_custom_message: 'string' === typeof message && !! message.length,
		} );

		if ( [ 'administrator', 'editor', 'author', 'contributor' ].includes( role ) ) {
			page( `/people/new/${ this.props.site.slug }/sent` );
		}
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
		return some( usernamesOrEmails, ( value ) => {
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
		const route = isEnabled( 'user-management-revamp' ) ? 'team' : 'team-members';
		const fallback = siteSlug ? `/people/${ route }/${ siteSlug }` : `/people/${ route }`;

		// Go back to last route with provided route as the fallback
		page.back( fallback );
	};

	renderRoleExplanation = () => {
		const { translate } = this.props;
		return (
			<a
				target="_blank"
				rel="noopener noreferrer"
				href={ localizeUrl( 'https://wordpress.com/support/user-roles/' ) }
				onClick={ this.onClickRoleExplanation }
			>
				{ translate( 'Learn more about roles' ) }
			</a>
		);
	};

	enableSSO = () => this.props.activateModule( this.props.siteId, 'sso' );

	isExternalRole = ( role ) => {
		const roles = [ 'administrator', 'editor', 'author', 'contributor' ];
		return includes( roles, role );
	};

	renderInviteForm = () => {
		const {
			site,
			translate,
			needsVerification,
			isAtomic,
			isJetpack,
			isPrivateSite: isPrivate,
			showSSONotice,
			includeSubscriberImporter,
		} = this.props;

		let includeFollower = isPrivate && ! isAtomic;
		const includeSubscriber = isAtomic;

		if ( ! includeSubscriberImporter ) {
			// Atomic private sites don't support Viewers/Followers.
			// @see https://github.com/Automattic/wp-calypso/issues/43919
			includeFollower = ! isAtomic;
		}

		const inviteForm = (
			<Card>
				<EmailVerificationGate>
					<form onSubmit={ this.submitForm }>
						<div role="group" className="invite-people__token-field-wrapper">
							<FormLabel htmlFor="usernamesOrEmails">
								{ translate( 'Usernames or emails' ) }
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
									'Enter up to 10 WordPress.com usernames or email addresses at a time.'
								) }
							</FormSettingExplanation>
						</div>

						<RoleSelect
							id="role"
							name="role"
							siteId={ this.props.siteId }
							onChange={ this.onRoleChange }
							onFocus={ this.onFocusRoleSelect }
							value={ this.state.role }
							disabled={ this.state.sendingInvites }
							includeFollower={ includeFollower }
							includeSubscriber={ includeSubscriber }
							explanation={ this.renderRoleExplanation() }
						/>

						{ ! this.props.isWPForTeamsSite && this.isExternalRole( this.state.role ) && (
							<ContractorSelect
								onChange={ this.onExternalChange }
								checked={ this.state.isExternal }
							/>
						) }

						<FormFieldset>
							<FormLabel htmlFor="message">{ translate( 'Custom message' ) }</FormLabel>
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
									'(Optional) Enter a custom message to be sent with your invitation.'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormButton disabled={ this.isSubmitDisabled() } onClick={ this.onClickSendInvites }>
							{ translate( 'Send invitation', 'Send invitations', {
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

		if ( showSSONotice ) {
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

	getInviteLinkRoles = () => {
		const { isAtomic, siteRoles, translate } = this.props;
		const wpcomFollowerRole = getWpcomFollowerRole( this.props.isPrivateSite, translate );

		if ( ! siteRoles || ! wpcomFollowerRole ) {
			return [];
		}

		// Atomic private sites don't support Viewers/Followers.
		// @see https://github.com/Automattic/wp-calypso/issues/43919
		if ( isAtomic && this.props.isPrivateSite ) {
			return siteRoles;
		}

		return siteRoles.concat( wpcomFollowerRole );
	};

	generateInviteLinks = () => {
		this.setState( {
			isGeneratingInviteLinks: true,
		} );

		this.props.recordTracksEvent( 'calypso_invite_people_generate_new_link_button_click' );

		return this.props.generateInviteLinks( this.props.siteId );
	};

	disableInviteLinks = () => {
		accept(
			<div>
				<p>
					{ this.props.translate(
						'Once this invite link is disabled, nobody will be able to use it to join your team. Are you sure?'
					) }
				</p>
			</div>,
			( accepted ) => {
				if ( accepted ) {
					this.props.disableInviteLinks( this.props.siteId );
					this.resetState();
				}
			},
			this.props.translate( 'Disable' )
		);
	};

	showInviteLinkForRole = ( event ) => {
		const { inviteLinks } = this.props;
		const role = event.target.value || 'administrator';
		this.setState( { activeInviteLink: inviteLinks[ role ] } );
		this.setState( { showCopyConfirmation: false } );
	};

	getActiveInviteLink = ( activeInviteLink ) => {
		if ( activeInviteLink ) {
			return activeInviteLink;
		}

		if ( this.props.inviteLinks && typeof this.props.inviteLinks.administrator !== 'undefined' ) {
			return this.props.inviteLinks.administrator;
		}

		return false;
	};

	onInviteLinkCopy = () => {
		this.setState( {
			showCopyConfirmation: true,
		} );

		clearTimeout( this.dismissCopyConfirmation );
		this.dismissCopyConfirmation = setTimeout( () => {
			this.setState( {
				showCopyConfirmation: false,
			} );
		}, 4000 );
	};

	renderCopyLinkButton = ( link, className ) => {
		const { translate } = this.props;

		let label;
		if ( this.state.showCopyConfirmation ) {
			label = translate( 'Copied!' );
		} else {
			label = translate( 'Copy link' );
		}

		return (
			<ClipboardButton
				className={ className }
				text={ link }
				onCopy={ this.onInviteLinkCopy }
				compact
			>
				{ label }
			</ClipboardButton>
		);
	};

	renderInviteLinkRoleSelector = ( activeInviteLink ) => {
		const { translate, inviteLinks } = this.props;
		const allRoles = this.getInviteLinkRoles();

		const roleOptions =
			allRoles &&
			allRoles.map( ( role ) => {
				if ( inviteLinks[ role.name ] ) {
					return (
						<option value={ role.name } key={ role.name }>
							{ role.display_name }
						</option>
					);
				}
			} );

		const inviteUrlRef = createRef();

		return (
			<Fragment>
				<div className="invite-people__link-selector">
					<FormSelect
						id="invite-people__link-selector-role"
						className="invite-people__link-selector-role"
						onChange={ this.showInviteLinkForRole }
					>
						{ roleOptions }
					</FormSelect>

					<FormTextInput
						id="invite-people__link-selector-text"
						className="invite-people__link-selector-text"
						value={ activeInviteLink.link }
						readOnly
						ref={ inviteUrlRef }
					/>
					{ this.renderCopyLinkButton(
						activeInviteLink.link,
						'invite-people__link-selector-copy'
					) }
				</div>

				<div className="invite-people__link-footer">
					<span className="invite-people__link-expiry">
						Expires on { new Date( activeInviteLink.expiry * 1000 ).toLocaleDateString() }{ ' ' }
					</span>
					<span>
						(
						<button className="invite-people__link-disable" onClick={ this.disableInviteLinks }>
							{ translate( 'Disable invite link' ) }
						</button>
						)
					</span>
				</div>
			</Fragment>
		);
	};

	renderInviteLinkGenerateButton = () => {
		const { translate } = this.props;

		return (
			<Button
				onClick={ this.generateInviteLinks }
				className="invite-people__link-generate"
				busy={ this.state.isGeneratingInviteLinks }
			>
				{ translate( 'Generate new link' ) }
			</Button>
		);
	};

	renderInviteLinkForm = () => {
		const { translate } = this.props;

		const activeInviteLink = this.getActiveInviteLink( this.state.activeInviteLink );

		const inviteLinkForm = (
			<Card className="invite-people__link">
				<EmailVerificationGate>
					<div className="invite-people__link-instructions">
						{ translate(
							'Use this link to onboard your users without having to invite them one by one. {{strong}}Anybody visiting this URL will be able to sign up to your organization,{{/strong}} even if they received the link from somebody else, so make sure that you share it with trusted people.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</div>

					{ activeInviteLink
						? this.renderInviteLinkRoleSelector( activeInviteLink )
						: this.renderInviteLinkGenerateButton() }
				</EmailVerificationGate>
			</Card>
		);

		return inviteLinkForm;
	};

	state = this.getInitialState();

	render() {
		const { site, translate, isWPForTeamsSite, isJetpack } = this.props;
		if ( site && ! userCan( 'promote_users', site ) ) {
			return (
				<Main>
					<PageViewTracker path="/people/new/:site" title="People > Invite People" />
					<EmptyContent
						title={ fixMe( {
							text: 'Only administrators can invite other people',
							newCopy: translate( 'Only administrators can invite other people' ),
							oldCopy: translate( 'Oops, only administrators can invite other people' ),
						} ) }
					/>
				</Main>
			);
		}

		return (
			<Main className="invite-people">
				<PageViewTracker path="/people/new/:site" title="People > Invite People" />
				{ site.ID && <QuerySiteInvites siteId={ site.ID } /> }
				{ site.ID && isJetpack && <QueryJetpackModules siteId={ site.ID } /> }

				<HeaderCake isCompact onClick={ this.goBack }>
					{ translate( 'Invite People to %(sitename)s', {
						args: {
							sitename: site.name,
						},
					} ) }
				</HeaderCake>
				{ isWPForTeamsSite && <P2TeamBanner context="invite" site={ site } /> }
				{ this.renderInviteForm() }
				{ isWPForTeamsSite && (
					<Fragment>
						<SectionHeader label={ translate( 'Invite Link' ) } />
						{ this.renderInviteLinkForm() }
					</Fragment>
				) }
			</Main>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const activating = isActivatingJetpackModule( state, siteId, 'sso' );
	const active = isJetpackModuleActive( state, siteId, 'sso' );

	return {
		siteId,
		needsVerification: ! isCurrentUserEmailVerified( state ),
		showSSONotice: ! ( activating || active ),
		isAtomic: isSiteAutomatedTransfer( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		inviteLinks: getInviteLinksForSite( state, siteId ),
		isPrivateSite: isPrivateSite( state, siteId ),
		includeSubscriberImporter: isEligibleForSubscriberImporter( state ),
	};
};

const mapDispatchToProps = {
	activateModule,
	generateInviteLinks,
	disableInviteLinks,
	errorNotice,
	successNotice,
	recordTracksEvent,
};

const connectComponent = connect( mapStateToProps, mapDispatchToProps );

export default connectComponent( localize( withSiteRoles( InvitePeople ) ) );
