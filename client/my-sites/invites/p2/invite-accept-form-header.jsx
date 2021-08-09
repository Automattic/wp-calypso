/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export function renderInviteAcceptFormHeader( props ) {
	return (
		<div className="invite-accept-form-header">
			<div className="invite-accept-form-header__site-icon">{ props.site.title.charAt( 0 ) }</div>
			<div className="invite-accept-form-header__join-site-title">
				{ props.translate( 'Join %(siteName)s on P2', {
					args: {
						siteName: props.site.title,
					},
				} ) }
			</div>
			<div className="invite-accept-form-header__join-site-text">
				{ props.translate(
					"You've been invited to join %(siteName)s on P2, a platform for teams to share, discuss, and collaborate openly, without interruption.",
					{
						args: {
							siteName: props.site.title,
						},
					}
				) }
			</div>
		</div>
	);
}
