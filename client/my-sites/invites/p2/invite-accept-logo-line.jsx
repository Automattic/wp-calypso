/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export function renderInviteAcceptP2Logo( props ) {
	return (
		<div className="invite-accept-logo-line">
			<div className="invite-accept-logo-line__learn-more">
				<a href="https://wordpress.com/p2" target="_blank" rel="noreferrer">
					{ props.translate( 'Learn more about P2' ) } →
				</a>
			</div>
		</div>
	);
}
