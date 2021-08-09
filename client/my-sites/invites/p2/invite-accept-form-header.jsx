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
			<div className="invite-accept-form-header__site-icon">
				<span>P2</span>
			</div>
			<div className="invite-accept-form-header__join-site-title">
				{ props.translate( 'Join %(siteName)s on P2', {
					args: {
						siteName: props.site.title,
					},
				} ) }
			</div>
			<div className="invite-accept-form-header__join-site-text">
				{ props.translate(
					'P2 is a platform for teams to share, discuss, and collaborate openly, without interruption.'
				) }
			</div>
		</div>
	);
}
