/**
 * External dependencies
 */
import React from 'react';
import Debug from 'debug';
import classNames from 'classnames';
import page from 'page';
import store from 'store';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import get from 'lodash/object/get'

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
		const acceptedInvite = store.get( 'invite_accepted' );
		if ( acceptedInvite && acceptedInvite.inviteKey === this.props.inviteKey ) {
			store.remove( 'invite_accepted' );
			page( this.getRedirectAfterAccept( acceptedInvite ) );
			this.acceptedNotice( acceptedInvite );
			return;
		}
		fetchInvite( this.props.siteId, this.props.inviteKey );
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

	acceptedNotice( invite ) {
		invite = invite || this.state.invite;
		let displayOnNextPage = true;
		let takeATour = (
			<p className="invite-message__intro">
				{
					this.translate(
						'Since you\'re new, you might like to {{docsLink}}take a tour{{/docsLink}}.',
						{ components: { docsLink: <a href="https://learn.wordpress.com/" target="_blank" /> } }
					)
				}
			</p>
		);
		let site = (
			<a href={ get( invite, 'site.URL' ) } className="invite-accept__notice-site-link">
				{ get( invite, 'site.title' ) }
			</a>
		);

		switch ( get( invite, 'role' ) ) {
			case 'follower':
				this.props.successNotice(
					this.translate(
						'You are now following {{site/}}', {
							components: { site }
						}
					),
					{
						button: this.translate( 'Visit Site' ),
						href: get( invite, 'site.URL' ),
						displayOnNextPage
					}
				);
				break;
			case 'administrator':
				this.props.successNotice(
					<div>
						<h3 className="invite-message__title">
							{ this.translate( 'You\'re now an Administrator of: {{site/}}', {
								components: { site }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ this.translate( 'This is your site dashboard where you will be able to manage all aspects of %(site)s', {
								args: { site: get( invite, 'site.title' ) }
							} ) }
						</p>
						{ takeATour }
					</div>,
					{ displayOnNextPage }
				);
				break;
			case 'editor':
				this.props.successNotice(
					<div>
						<h3 className="invite-message__title">
							{ this.translate( 'You\'re now an Editor of: {{site/}}', {
								components: { site }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ this.translate( 'This is your site dashboard where you can publish and manage your own posts and the posts of others, as well as upload media.' ) }
						</p>
						{ takeATour }
					</div>,
					{ displayOnNextPage }
				);
				break;
			case 'author':
				this.props.successNotice(
					<div>
						<h3 className="invite-message__title">
							{ this.translate( 'You\'re now an Author of: {{site/}}', {
								components: { site }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ this.translate( 'This is your site dashboard where you can publish and edit your own posts as well as upload media.' ) }
						</p>
						{ takeATour }
					</div>,
					{ displayOnNextPage }
				);
				break;
			case 'contributor':
				this.props.successNotice(
					<div>
						<h3 className="invite-message__title">
							{ this.translate( 'You\'re now a Contributor of: {{site/}}', {
								components: { site }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ this.translate( 'This is your site dashboard where you can write and manage your own posts.' ) }
						</p>
						{ takeATour }
					</div>,
					{ displayOnNextPage }
				);
				break;
			case 'subscriber':
				this.props.successNotice(
					this.translate( 'You\'re now a Subscriber of: {{site/}}', {
						components: { site }
					} ),
					{ displayOnNextPage }
				);
				break;
		}
	},

	getRedirectAfterAccept( invite = this.state.invite ) {
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
		this.props.infoNotice( this.translate( 'You declined to join.' ), { displayOnNextPage: true } );
		page( '/' );
	},

	renderForm() {
		if ( ! this.state.invite ) {
			debug( 'Not rendering form - Invite not set' );
			return null;
		}
		debug( 'Rendering invite' );
		return this.state.user
			? <LoggedIn { ...this.state.invite } redirectTo={ this.getRedirectAfterAccept() } decline={ this.decline } user={ this.state.user } acceptedNotice={ this.acceptedNotice } />
			: <LoggedOut { ...this.state.invite } decline={ this.decline } />;
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
		const classes = classNames( 'invite-accept', { 'is-error': !! this.state.error } );
		return (
			<div className={ classes }>
				{ ! this.state.error && <InviteHeader { ...this.state.invite } /> }
				{ this.state.error ? this.renderError() : this.renderForm() }
			</div>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice, infoNotice }, dispatch )
)( InviteAccept );
