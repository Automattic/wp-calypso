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
import user from 'lib/user';
import { fetchInvite } from 'lib/invites/actions';
import InvitesStore from 'lib/invites/stores/invites-validation';
import EmptyContent from 'components/empty-content';
import { successNotice, infoNotice } from 'state/notices/actions';
import analytics from 'analytics';
import { getRedirectAfterAccept } from 'my-sites/invites/utils';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:invite-accept' );
const userModule = user();

let InviteAccept = React.createClass( {

	getInitialState() {
		return {
			invite: false,
			error: false,
			user: userModule.get()
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
	},

	isErrorState() {
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

	renderForm() {
		if ( ! this.state.invite ) {
			debug( 'Not rendering form - Invite not set' );
			return null;
		}
		debug( 'Rendering invite' );
		let props = {
			invite: this.state.invite,
			redirectTo: getRedirectAfterAccept( this.state.invite ),
			decline: this.decline
		};
		return this.state.user
			? <LoggedIn { ... props } user={ this.state.user } />
			: <LoggedOut { ... props } />
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

	render() {
		const classes = classNames( 'invite-accept', { 'is-error': !! this.isErrorState() } );
		return (
			<div className={ classes }>
				{ ! this.isErrorState() && <InviteHeader { ...this.state.invite } /> }
				{ this.isErrorState() ? this.renderError() : this.renderForm() }
			</div>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice, infoNotice }, dispatch )
)( InviteAccept );
