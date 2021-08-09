/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export function renderInviteAcceptFooter( props ) {
	return (
		<div className="invite-accept-footer">
			<img
				src="/calypso/images/p2/w-logo.png"
				className="invite-accept-footer__w-logo"
				alt="WP.com logo"
			/>
			<span className="invite-accept-footer__footer-text">
				{ props.translate( 'Powered by WordPress.com' ) }
			</span>
		</div>
	);
}
