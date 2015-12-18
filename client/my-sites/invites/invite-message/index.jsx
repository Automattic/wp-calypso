/**
 * External dependencies
 */
import React from 'react'
import get from 'lodash/object/get';

/**
 * Internal dependencies
 */
import Notice from 'components/notice'
import NoticeAction from 'components/notice/notice-action';
import { dismissInviteAccepted, dismissInviteDeclined } from 'lib/invites/actions'
import store from 'lib/invites/stores/invite-accepted'

export default React.createClass( {

	getInitialState: function() {
		return store.get();
	},

	componentWillMount() {
		store.on( 'change', () => this.setState( this.getInitialState ) );
	},

	componentWillUnmount() {
		store.off( 'change', () => this.setState( this.getInitialState ) );
	},

	render() {
		if ( ! this.props.sites ) {
			return null;
		}

		let inviteNotice = null;

		const { accepted, declined, invite } = this.state;
		if ( accepted ) {
			if ( 'follower' === get( invite, 'role' ) ) {
				inviteNotice = (
					<Notice

						status="is-success"
						onDismissClick={ dismissInviteAccepted }
						text={ this.translate( 'You are now following %(site)s', {
							args: { site: get( invite, 'site.title' ) }
						} ) } >
						<NoticeAction external href={ get( invite, 'site.URL' ) } >
							{ this.translate( 'Visit Site' ) }
						</NoticeAction>
					</Notice>
				);
			} else {
				inviteNotice = (
					<Notice status="is-success" onDismissClick={ dismissInviteAccepted }>
						<h3 className="invite-message__title">
							{ this.translate( 'You\'re now a user of: %(site)s', {
								args: { site: get( invite, 'site.title' ) }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ this.translate( 'This is your site dashboard where you can write posts and control your site. ' ) }
						</p>
						<p className="invite-message__intro">
							{
								this.translate(
									'Since you\'re new, you might like to {{docsLink}}take a tour{{/docsLink}}.',
									{ components: { docsLink: <a href="http://en.support.wordpress.com/" target="_blank" /> } }
								)
							}
						</p>
					</Notice>
				);
			}
		} else if ( declined ) {
			inviteNotice = (
				<Notice status="is-info" onDismissClick={ dismissInviteDeclined }>
					<h3>
						{ this.translate( 'You declined to join.' ) }
					</h3>
				</Notice>
			);
		}

		return inviteNotice;
	}
} )
