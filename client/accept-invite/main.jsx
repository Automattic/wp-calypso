/**
 * External dependencies
 */
import React from 'react';
import Debug from 'debug';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import InviteHeader from './invite-header';
import LoggedInAccept from './logged-in-accept';
import LoggedOutInvite from './logged-out-invite';
import userModule from 'lib/user';
import InvitesActions from 'lib/invites/actions';
import InvitesStore from 'lib/invites/stores/invites-validation';
import EmptyContent from 'components/empty-content';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:accept-invite' );
const user = userModule();

export default React.createClass( {

	displayName: 'AcceptInvite',

	getInitialState() {
		return {
			invite: false,
			error: false
		}
	},

	componentWillMount() {
		InvitesActions.fetchInvite( this.props.site_id, this.props.invitation_key );
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
		const redirectTo = window.location.origin,
			{ invite } = this.state.invite;
		switch ( invite.meta.role ) {
			case 'viewer':
			case 'follower':
				return redirectTo;
				break;
			default:
				return redirectTo + '/posts/' + invite.blog_id;
		}
	},

	renderForm() {
		if ( ! this.state.invite ) {
			debug( 'Not rendering form - Invite not set' );
			return null;
		}
		debug( 'Rendering invite' );
		return user.get()
			? <LoggedInAccept { ...this.state.invite } redirectTo={ this.getRedirectTo() } />
		: <LoggedOutInvite { ...this.state.invite } redirectTo={ this.getRedirectTo() } />;
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
		let classes = classNames( 'accept-invite', { 'is-error': !! this.state.error } );
		return (
			<div className={ classes }>
				{ ! this.state.error && <InviteHeader { ...this.state.invite } /> }
				{ this.state.error ? this.renderError() : this.renderForm() }
			</div>
		);
	}
} );
