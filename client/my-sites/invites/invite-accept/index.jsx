/**
 * External dependencies
 */
import React from 'react';
import Debug from 'debug';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal Dependencies
 */
import InviteHeader from 'my-sites/invites/invite-header';
import LoggedIn from 'my-sites/invites/invite-accept-logged-in';
import LoggedOut from 'my-sites/invites/invite-accept-logged-out';
import userModule from 'lib/user';
import { fetchInvite, displayInviteDeclined } from 'lib/invites/actions';
import InvitesStore from 'lib/invites/stores/invites-validation';
import EmptyContent from 'components/empty-content';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:invite-accept' );
const user = userModule().get();

export default React.createClass( {

	displayName: 'InviteAccept',

	getInitialState() {
		return {
			invite: false,
			error: false
		}
	},

	componentWillMount() {
		fetchInvite( this.props.siteId, this.props.inviteKey );
		InvitesStore.on( 'change', this.refreshInvite );
	},

	componentWillUnmount() {
		InvitesStore.off( 'change', this.refreshInvite );
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

	refreshRedirectPath() {
		this.setState( { redirectPath: this.getRedirectAfterAccept() } );
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

	getRedirectAfterAccept() {
		const { invite } = this.state
		switch ( invite.role ) {
			case 'viewer':
			case 'follower':
				return '/';
				break;
			default:
				return '/posts/' + this.props.siteId;
		}
	},

	decline() {
		page( '/' );
		displayInviteDeclined();
	},

	renderForm() {
		if ( ! this.state.invite ) {
			debug( 'Not rendering form - Invite not set' );
			return null;
		}
		debug( 'Rendering invite' );
		return user
			? <LoggedIn { ...this.state.invite } redirectTo={ this.getRedirectAfterAccept() } decline={ this.decline } user={ user } />
			: <LoggedOut { ...this.state.invite } redirectTo={ this.getRedirectAfterAccept() } decline={ this.decline } />;
	},

	renderError() {
		debug( 'Rendering error: ' + JSON.stringify( this.state.error ) );
		return (
			<EmptyContent
				title={ this.getErrorTitle() }
				line={ this.getErrorMessage() }
				illustration={ '/calypso/images/drake/drake-whoops.svg' }
			/>
		);
	},

	render() {
		let classes = classNames( 'invite-accept', { 'is-error': !! this.state.error } );
		return (
			<div className={ classes }>
				{ ! this.state.error && <InviteHeader { ...this.state.invite } /> }
				{ this.state.error ? this.renderError() : this.renderForm() }
			</div>
		);
	}
} );
