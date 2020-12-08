/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import Debug from 'debug';
import classNames from 'classnames';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import LoggedIn from 'calypso/my-sites/invites/invite-accept-logged-in';
import LoggedOut from 'calypso/my-sites/invites/invite-accept-logged-out';
import { login } from 'calypso/lib/paths';
import EmptyContent from 'calypso/components/empty-content';
import { successNotice, infoNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getRedirectAfterAccept } from 'calypso/my-sites/invites/utils';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import userUtils from 'calypso/lib/user/utils';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import wpcom from 'calypso/lib/wp';
import normalizeInvite from './utils/normalize-invite';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import whoopsImage from 'calypso/assets/images/illustrations/whoops.svg';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:invite-accept' );

class InviteAccept extends React.Component {
	state = {
		invite: false,
		error: false,
		matchEmailError: false,
	};

	mounted = false;

	componentDidMount() {
		this.mounted = true;

		// The site ID and invite key are required, so only fetch if set
		if ( this.props.siteId && this.props.inviteKey ) {
			this.fetchInvite();
		}
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	async fetchInvite() {
		try {
			const response = await wpcom
				.undocumented()
				.getInvite( this.props.siteId, this.props.inviteKey );

			const invite = {
				...normalizeInvite( response ),
				activationKey: this.props.activationKey,
				authKey: this.props.authKey,
			};

			// Replace the plain invite key with the strengthened key
			// from the url: invite key + secret
			invite.inviteKey = this.props.inviteKey;

			this.handleFetchInvite( false, invite );
		} catch ( error ) {
			this.handleFetchInvite( error );

			recordTracksEvent( 'calypso_invite_validation_failure', {
				error: error.error,
			} );
		}
	}

	handleFetchInvite( error, invite = false ) {
		if ( ! this.mounted ) {
			return;
		}

		this.setState( { error, invite } );
	}

	isMatchEmailError = () => {
		const { invite } = this.state;
		return invite && invite.forceMatchingEmail && this.props.user.email !== invite.sentTo;
	};

	isInvalidInvite = () => {
		return this.state.error || ! this.props.siteId || ! this.props.inviteKey;
	};

	clickedNoticeSiteLink = () => {
		recordTracksEvent( 'calypso_invite_accept_notice_site_link_click' );
	};

	decline = () => {
		this.props.infoNotice( this.props.translate( 'You declined to join.' ), {
			displayOnNextPage: true,
		} );
		page( '/' );
	};

	signInLink = () => {
		const invite = this.state.invite;
		let loginUrl = login( { redirectTo: window.location.href } );

		if ( invite && invite.sentTo ) {
			const presetEmail = '&email_address=' + encodeURIComponent( invite.sentTo );
			loginUrl += presetEmail;
		}

		return loginUrl;
	};

	signUpLink = () => {
		userUtils.logout( window.location.href );
	};

	localeSuggestions = () => {
		if ( this.props.user || ! this.props.locale ) {
			return;
		}

		return <LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />;
	};

	renderForm = () => {
		const { invite } = this.state;

		if ( ! invite ) {
			debug( 'Not rendering form - Invite not set' );
			return null;
		}
		debug( 'Rendering invite' );

		const props = {
			invite,
			redirectTo: getRedirectAfterAccept( invite ),
			decline: this.decline,
			signInLink: this.signInLink(),
			forceMatchingEmail: this.isMatchEmailError(),
		};

		return this.props.user ? (
			<LoggedIn { ...props } user={ this.props.user } />
		) : (
			<LoggedOut { ...props } />
		);
	};

	renderError = () => {
		const { error } = this.state;
		debug( 'Rendering error: %o', error );

		const props = {
			title: this.props.translate( 'Oops, that invite is not valid', {
				context: 'Title that is display to users when attempting to accept an invalid invite.',
			} ),
			line: this.props.translate( "We weren't able to verify that invitation.", {
				context: 'Message that is displayed to users when an invitation is invalid.',
			} ),
			illustration: whoopsImage,
		};

		if ( error.error && error.message ) {
			switch ( error.error ) {
				case 'already_member':
				case 'already_subscribed':
					Object.assign( props, {
						title: error.message, // "You are already a (follower|member) of this site"
						line: this.props.translate(
							'Would you like to accept the invite with a different account?'
						),
						action: this.props.translate( 'Switch Accounts' ),
						actionURL: login( { redirectTo: window.location.href } ),
					} );
					break;
				case 'unauthorized_created_by_self':
					Object.assign( props, {
						line: error.message, // "You can not use an invitation that you have created for someone else."
						action: this.props.translate( 'Switch Accounts' ),
						actionURL: login( { redirectTo: window.location.href } ),
					} );
					break;
				default:
					Object.assign( props, {
						line: error.message,
					} );
					break;
			}
		}

		return <EmptyContent { ...props } />;
	};

	renderNoticeAction = () => {
		const { invite } = this.state;
		const { user } = this.props;

		if ( ! user && ! invite.knownUser ) {
			return;
		}

		let props;
		let actionText = this.props.translate( 'Switch Accounts' );

		if ( ! user ) {
			actionText = this.props.translate( 'Sign In' );
		}

		if ( invite.knownUser ) {
			props = { href: this.signInLink() };
		} else {
			props = { onClick: this.signUpLink };
		}

		return <NoticeAction { ...props }>{ actionText }</NoticeAction>;
	};

	render() {
		const formClasses = classNames( 'invite-accept__form', {
			'is-error': !! this.isInvalidInvite(),
		} );
		const { invite } = this.state;
		const { user } = this.props;

		return (
			<div className="invite-accept">
				{ this.localeSuggestions() }
				<div className={ formClasses }>
					{ this.isMatchEmailError() && user && (
						<Notice
							text={ this.props.translate( 'This invite is only valid for %(email)s.', {
								args: { email: invite.sentTo },
							} ) }
							status="is-error"
							showDismiss={ false }
						>
							{ this.renderNoticeAction() }
						</Notice>
					) }
					{ this.isInvalidInvite() ? this.renderError() : this.renderForm() }
				</div>
			</div>
		);
	}
}

export default connect( ( state ) => ( { user: getCurrentUser( state ) } ), {
	successNotice,
	infoNotice,
} )( localize( InviteAccept ) );
