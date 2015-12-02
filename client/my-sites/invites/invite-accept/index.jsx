/**
 * External dependencies
 */
import React from 'react';
import Debug from 'debug';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import InviteHeader from 'my-sites/invites/invite-header';
import LoggedIn from 'my-sites/invites/invite-accept-logged-in';
import LoggedOut from 'my-sites/invites/invite-accept-logged-out';
import userModule from 'lib/user';
import { fetchInvite } from 'lib/invites/actions';
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
		fetchInvite( this.props.site_id, this.props.invitation_key );
		InvitesStore.on( 'change', this.refreshInvite );
	},

	componentWillUnmount() {
		InvitesStore.off( 'change', this.refreshInvite );
	},

	refreshInvite() {
		const invite = InvitesStore.getInvite( this.props.site_id, this.props.invitation_key );
		const error = InvitesStore.getInviteError( this.props.site_id, this.props.invitation_key );
		this.setState( { invite, error } );
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

	getRedirectTo() {
		const { invite } = this.state.invite;
		let redirectTo = window.location.origin;
		switch ( invite.meta.role ) {
			case 'viewer':
			case 'follower':
				break;
			default:
				redirectTo += '/posts/' + invite.blog_id;
		}
		return redirectTo += '?invite_accepted=' + invite.blog_id;
	},

	renderForm() {
		if ( ! this.state.invite ) {
			debug( 'Not rendering form - Invite not set' );
			return null;
		}
		debug( 'Rendering invite' );
			: <LoggedOut { ...this.state.invite } redirectTo={ this.getRedirectTo() } />;
		return user
			? <LoggedIn { ...this.state.invite } user={ user } />
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
