/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import { filter, flowRight, get, groupBy, includes, isEmpty, pickBy, some, uniqueId } from 'lodash';
import debugModule from 'debug';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ContractorSelect from 'calypso/my-sites/people/contractor-select';
import RoleSelect from 'calypso/my-sites/people/role-select';
import TokenField from 'calypso/components/token-field';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import {
	sendInvites,
	createInviteValidation,
	generateInviteLinks,
	disableInviteLinks,
} from 'calypso/lib/invites/actions';
import { Card, Button } from '@automattic/components';
import Main from 'calypso/components/main';
import HeaderCake from 'calypso/components/header-cake';
import CountedTextarea from 'calypso/components/forms/counted-textarea';
import InvitesSentStore from 'calypso/lib/invites/stores/invites-sent';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import EmptyContent from 'calypso/components/empty-content';
import { userCan } from 'calypso/lib/site/utils';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import FeatureExample from 'calypso/components/feature-example';
import versionCompare from 'calypso/lib/version-compare';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import {
	getInviteLinksForSite,
	getErrors as getValidationErrors,
	getSuccess as getValidationSuccess,
} from 'calypso/state/invites/selectors';
import { getSiteRoles, getWpcomFollowerRole } from 'calypso/state/site-roles/selectors';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import SectionHeader from 'calypso/components/section-header';
import accept from 'calypso/lib/accept';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:people:invite' );

class InvitePeople extends React.Component {
	static displayName = 'InvitePeople';

	componentDidMount() {
		InvitesSentStore.on( 'change', this.refreshFormState );
	}

	componentDidUpdate( prevProps ) {
		const { validationSuccess, validationErrors } = this.props;

		if (
			this.state.role &&
			( prevProps.validationSuccess !== validationSuccess ||
				prevProps.validationErrors !== validationErrors )
		) {
			this.refreshValidation(
				validationSuccess[ this.state.role ],
				validationErrors[ this.state.role ]
			);
		}
	}

	componentWillUnmount() {
		InvitesSentStore.off( 'change', this.refreshFormState );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			this.props.siteId !== nextProps.siteId ||
			this.props.needsVerification !== nextProps.needsVerification ||
			this.props.showSSONotice !== nextProps.showSSONotice ||
			this.props.isJetpack !== nextProps.isJetpack ||
			this.props.isSiteAutomatedTransfer !== nextProps.isSiteAutomatedTransfer
		) {
			this.setState( this.resetState( nextProps ) );
		}
	}

	resetState = ( props = this.props ) => {
		const { isWPForTeamsSite } = props;

		const defaultRole = isWPForTeamsSite ? 'editor' : 'follower';

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

	refreshFormState = () => {
		const sendInvitesSuccess = InvitesSentStore.getSuccess( this.state.formId );

		if ( sendInvitesSuccess ) {
			this.setState( this.resetState() );
			this.props.recordTracksEventAction( 'calypso_invite_people_form_refresh_initial' );
			debug( 'Submit successful. Resetting form.' );
		} else {
			const sendInvitesErrored = InvitesSentStore.getErrors( this.state.formId );
			const errors = get( sendInvitesErrored, 'errors', {} );
			const updatedState = { sendingInvites: false };
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
			this.props.recordTracksEventAction( 'calypso_invite_people_form_refresh_retry' );
		}
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
			return includes( filteredTokens, key );
		} );

		const filteredSuccess = filter( success, ( successfulValidation ) => {
			return includes( filteredTokens, successfulValidation );
		} );

		this.setState( {
			usernamesOrEmails: filteredTokens,
			errors: filteredErrors,
			success: filteredSuccess,
			errorToDisplay: includes( filteredTokens, errorToDisplay ) && errorToDisplay,
		} );
		this.props.createInviteValidation( this.props.siteId, filteredTokens, role );

		if ( filteredTokens.length > usernamesOrEmails.length ) {
			this.props.recordTracksEventAction( 'calypso_invite_people_token_added' );
		} else {
			this.props.recordTracksEventAction( 'calypso_invite_people_token_removed' );
		}
	};

	onMessageChange = ( event ) => this.setState( { message: event.target.value } );

	onRoleChange = ( event ) => {
		const role = event.target.value;
		this.setState( { role } );
		this.props.createInviteValidation( this.props.siteId, this.state.usernamesOrEmails, role );
	};

	onExternalChange = ( event ) => {
		const isExternal = event.target.checked;
		this.setState( { isExternal } );
	};

	refreshValidation = ( success = {}, errors = {} ) => {
		const errorsKeys = Object.keys( errors );
		const errorToDisplay =
			this.state.errorToDisplay || ( errorsKeys.length > 0 && errorsKeys[ 0 ] );

		this.setState( {
			errorToDisplay,
			errors,
			success,
		} );

		if ( errorsKeys.length ) {
			this.props.recordTracksEventAction( 'calypso_invite_people_validation_refreshed_with_error' );
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

	submitForm = ( event ) => {
		event.preventDefault();
		debug( 'Submitting invite form. State: ' + JSON.stringify( this.state ) );

		if ( this.isSubmitDisabled() ) {
			return false;
		}

		const formId = uniqueId();
		const { usernamesOrEmails, message, role, isExternal } = this.state;

		this.setState( { sendingInvites: true, formId } );
		this.props.sendInvites(
			this.props.siteId,
			usernamesOrEmails,
			role,
			message,
			formId,
			isExternal
		);

		const groupedInvitees = groupBy( usernamesOrEmails, ( invitee ) => {
			return includes( invitee, '@' ) ? 'email' : 'username';
		} );

		this.props.recordTracksEventAction( 'calypso_invite_people_form_submit', {
			role,
			is_external: isExternal,
			number_invitees: usernamesOrEmails.length,
			number_username_invitees: groupedInvitees.username ? groupedInvitees.username.length : 0,
			number_email_invitees: groupedInvitees.email ? groupedInvitees.email.length : 0,
			has_custom_message: 'string' === typeof message && !! message.length,
		} );

		if ( includes( [ 'administrator', 'editor', 'author', 'contributor' ], role ) ) {
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
		const fallback = siteSlug ? '/people/team/' + siteSlug : '/people/team';

		// Go back to last route with /people/team/$site as the fallback
		page.back( fallback );
	};

	renderRoleExplanation = () => {
		const { translate, onClickRoleExplanation } = this.props;
		return (
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="http://wordpress.com/support/user-roles/"
				onClick={ onClickRoleExplanation }
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
			isJetpack,
			showSSONotice,
			onClickSendInvites,
			onFocusTokenField,
			onFocusRoleSelect,
			onFocusCustomMessage,
		} = this.props;

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
								onFocus={ onFocusTokenField }
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
							includeFollower
							siteId={ this.props.siteId }
							onChange={ this.onRoleChange }
							onFocus={ onFocusRoleSelect }
							value={ this.state.role }
							disabled={ this.state.sendingInvites }
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
								onFocus={ onFocusCustomMessage }
								value={ this.state.message }
								disabled={ this.state.sendingInvites }
							/>
							<FormSettingExplanation>
								{ translate(
									'(Optional) Enter a custom message to be sent with your invitation.'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormButton disabled={ this.isSubmitDisabled() } onClick={ onClickSendInvites }>
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

	getInviteLinkRoles = () => {
		const { siteRoles, wpcomFollowerRole } = this.props;

		if ( ! siteRoles || ! wpcomFollowerRole ) {
			return [];
		}

		return siteRoles.concat( wpcomFollowerRole );
	};

	isValidInviteLinkRole = ( inviteLinkRole ) => {
		const roles = this.getInviteLinkRoles();
		return roles.some( ( role ) => role === inviteLinkRole );
	};

	generateInviteLinks = () => {
		this.setState( {
			isGeneratingInviteLinks: true,
		} );

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
					this.setState( this.resetState() );
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

		const inviteUrlRef = React.createRef();

		return (
			<React.Fragment>
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
			</React.Fragment>
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
							'Use this link to onboard your team members without having to invite them one by one. {{strong}}Anybody visiting this URL will be able to sign up to your organization,{{/strong}} even if they received the link from somebody else, so make sure that you share it with trusted people.',
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

	state = this.resetState();

	render() {
		const { site, translate, isWPForTeamsSite, isJetpack } = this.props;
		if ( site && ! userCan( 'promote_users', site ) ) {
			return (
				<Main>
					<PageViewTracker path="/people/new/:site" title="People > Invite People" />
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
				<PageViewTracker path="/people/new/:site" title="People > Invite People" />
				{ site.ID && <QuerySiteInvites siteId={ site.ID } /> }
				{ site.ID && isJetpack && <QueryJetpackModules siteId={ site.ID } /> }

				<SidebarNavigation />
				<HeaderCake isCompact onClick={ this.goBack }>
					{ translate( 'Invite People' ) }
				</HeaderCake>
				{ this.renderInviteForm() }
				{ isWPForTeamsSite && (
					<React.Fragment>
						<SectionHeader label={ translate( 'Invite Link' ) } />
						{ this.renderInviteLinkForm() }
					</React.Fragment>
				) }
			</Main>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const activating = isActivatingJetpackModule( state, siteId, 'sso' );
		const active = isJetpackModuleActive( state, siteId, 'sso' );

		return {
			siteId,
			needsVerification: ! isCurrentUserEmailVerified( state ),
			showSSONotice: ! ( activating || active ),
			isJetpack: isJetpackSite( state, siteId ),
			isSiteAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
			inviteLinks: getInviteLinksForSite( state, siteId ),
			siteRoles: getSiteRoles( state, siteId ),
			wpcomFollowerRole: getWpcomFollowerRole( state, siteId ),
			validationErrors: getValidationErrors( state, siteId ),
			validationSuccess: getValidationSuccess( state, siteId ),
		};
	},
	( dispatch ) => ( {
		...bindActionCreators(
			{
				sendInvites,
				activateModule,
				generateInviteLinks,
				disableInviteLinks,
				createInviteValidation,
			},
			dispatch
		),
		recordTracksEventAction,
		onFocusTokenField: () =>
			dispatch( recordTracksEventAction( 'calypso_invite_people_token_field_focus' ) ),
		onFocusRoleSelect: () =>
			dispatch( recordTracksEventAction( 'calypso_invite_people_role_select_focus' ) ),
		onFocusCustomMessage: () =>
			dispatch( recordTracksEventAction( 'calypso_invite_people_custom_message_focus' ) ),
		onClickSendInvites: () =>
			dispatch( recordTracksEventAction( 'calypso_invite_people_send_invite_button_click' ) ),
		onClickRoleExplanation: () =>
			dispatch( recordTracksEventAction( 'calypso_invite_people_role_explanation_link_click' ) ),
	} )
);

export default flowRight(
	connectComponent,
	localize,
	withTrackingTool( 'HotJar' )
)( InvitePeople );
