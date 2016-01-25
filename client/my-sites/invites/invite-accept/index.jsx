/**
 * External dependencies
 */
import React from 'react';
import Debug from 'debug';
import classNames from 'classnames';
import page from 'page';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal Dependencies
 */
import InviteHeader from 'my-sites/invites/invite-header';
import LoggedIn from 'my-sites/invites/invite-accept-logged-in';
import LoggedOut from 'my-sites/invites/invite-accept-logged-out';
import _user from 'lib/user';
import { fetchInvite } from 'lib/invites/actions';
import InvitesStore from 'lib/invites/stores/invites-validation';
import EmptyContent from 'components/empty-content';
import { successNotice, infoNotice } from 'state/notices/actions';
import analytics from 'analytics';
import { getRedirectAfterAccept } from 'my-sites/invites/utils';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import config from 'config';
import userUtils from 'lib/user/utils';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:invite-accept' );
const userModule = _user();

let InviteAccept = React.createClass( {

	getInitialState() {
		return {
			invite: false,
			error: false,
			user: userModule.get(),
			matchEmailError: false
		}
	},

	componentWillMount() {
		// The site ID and invite key are required, so only fetch if set
		if ( this.props.siteId && this.props.inviteKey ) {
			fetchInvite( this.props.siteId, this.props.inviteKey );
		}

		userModule.on( 'change', this.refreshUser );
		InvitesStore.on( 'change', this.refreshInvite );
	},

	componentWillUnmount() {
		InvitesStore.off( 'change', this.refreshInvite );
		userModule.off( 'change', this.refreshUser );
	},

	refreshUser() {
		this.setState( { user: userModule.get() } );
		this.refreshMatchEmailError();
	},

	refreshInvite() {
		const invite = InvitesStore.getInvite( this.props.siteId, this.props.inviteKey );
		const error = InvitesStore.getInviteError( this.props.siteId, this.props.inviteKey );

		if ( invite ) {
			// add subscription-related keys to the invite
			Object.assign( invite, {
				activationKey: this.props.activationKey,
				authKey: this.props.authKey
			} );
		}
		this.setState( { invite, error } );
		this.refreshMatchEmailError();
	},

	refreshMatchEmailError() {
		const { invite, user } = this.state;
		this.setState( { matchEmailError: invite.forceMatchingEmail && user.email !== invite.sentTo } );
	},

	isInvalidInvite() {
		return this.state.error || ! this.props.siteId || ! this.props.inviteKey;
	},

	getErrorTitle() {
		return this.translate(
			'Oops, your invite is not valid',
			{ context: 'Title that is display to users when attempting to accept an invalid invite.' }
		);
	},

	getErrorMessage() {
		return this.translate(
			"We weren't able to verify that invitation.",
			{ context: 'Message that is displayed to users when an invitation is invalid.' }
		);
	},

	clickedNoticeSiteLink() {
		analytics.tracks.recordEvent( 'calypso_invite_accept_notice_site_link_click' );
	},

	decline() {
		this.props.infoNotice( this.translate( 'You declined to join.' ), { displayOnNextPage: true } );
		page( '/' );
	},

	signInLink() {
		const invite = this.state.invite;
		let loginUrl = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );

		if ( invite && invite.sentTo ) {
			let presetEmail = '&email_address=' + encodeURIComponent( invite.sentTo );
			loginUrl += presetEmail;
		}

		return loginUrl;
	},

	signUpLink() {
		userUtils.logout( window.location.href );
	},

	renderForm() {
		const { invite, user, matchEmailError } = this.state;
		if ( ! invite ) {
			debug( 'Not rendering form - Invite not set' );
			return null;
		}
		debug( 'Rendering invite' );

		let props = {
			invite: this.state.invite,
			redirectTo: getRedirectAfterAccept( this.state.invite ),
			decline: this.decline,
			signInLink: this.signInLink(),
			forceMatchingEmail: matchEmailError
		};
		return user
			? <LoggedIn { ... props } user={ this.state.user } />
			: <LoggedOut { ... props } />;
	},

	renderError() {
		debug( 'Rendering error: ' + JSON.stringify( this.state.error ) );
		return (
			<EmptyContent
				title={ this.getErrorTitle() }
				line={ this.getErrorMessage() }
				illustration={ '/calypso/images/drake/drake-whoops.svg' } />
		);
	},

	renderNoticeAction() {
		const { user, invite } = this.state;

		if ( ! user ) {
			return;
		}

		let props;

		if ( invite.knownUser ) {
			props = { href: this.signInLink() };
		} else {
			props = { onClick: this.signUpLink };
		}

		return (
			<NoticeAction { ... props } >
				{ this.translate( 'Switch Accounts' ) }
			</NoticeAction>
		);
	},

	render() {
		const classes = classNames( 'invite-accept', { 'is-error': !! this.isInvalidInvite() } ),
			{ invite, matchEmailError } = this.state;

		return (
			<div className={ classes }>
				{ matchEmailError &&
					<Notice
						text={ this.translate( 'This invite is only valid for %(email)s.', { args: { email: invite.sentTo } } ) }
						status="is-error"
						showDismiss={ false } >
						{ this.renderNoticeAction() }
					</Notice>
				}
				{ ! this.isInvalidInvite() && <InviteHeader { ... invite } /> }
				{ this.isInvalidInvite() ? this.renderError() : this.renderForm() }
			</div>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice, infoNotice }, dispatch )
)( InviteAccept );
