import React from 'react';
import Dispatcher from 'dispatcher'
import { action as ActionTypes } from 'lib/invites/constants'
import notices from 'notices'
import i18n from 'lib/mixins/i18n'
import get from 'lodash/object/get'

const InviteNotices = {};

InviteNotices.dispatchToken = Dispatcher.register( ( payload ) => {
	const { type, invite, displayOnNextPage } = payload.action;
	switch ( type ) {
		case ActionTypes.INVITE_ACCEPTED:
		case ActionTypes.DISPLAY_INVITE_ACCEPTED_NOTICE:
			if ( 'follower' === get( invite, 'role' ) ) {
				notices.success(
					i18n.translate(
						'You are now following %(site)s', {
							args: { site: get( invite, 'site.title' ) }
						}
					),
					{
						button: i18n.translate( 'Visit Site' ),
						href: get( invite, 'site.URL' ),
						displayOnNextPage
					}
				);
			} else {
				notices.success(
					(
						<div>
							<h3 className="invite-message__title">
								{ i18n.translate( 'You\'re now a user of: %(site)s', {
									args: { site: get( invite, 'site.title' ) }
								} ) }
							</h3>
							<p className="invite-message__intro">
								{ i18n.translate( 'This is your site dashboard where you can write posts and control your site. ' ) }
							</p>
							<p className="invite-message__intro">
								{
									i18n.translate(
										'Since you\'re new, you might like to {{docsLink}}take a tour{{/docsLink}}.',
										{ components: { docsLink: <a href="http://en.support.wordpress.com/" target="_blank" /> } }
									)
								}
							</p>
						</div>
					),
					{
						displayOnNextPage
					}
				)
			}
			break;
		case ActionTypes.DISPLAY_INVITE_DECLINED_NOTICE:
			notices.info( i18n.translate( 'You declined to join.' ) );
			break;
	}
} );

export default InviteNotices;
