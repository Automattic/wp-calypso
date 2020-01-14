/**
 * External Dependencies
 */
import React from 'react';
import { Gridicon } from '@automattic/components';

/**
 * Style dependencies
 */
import './sidebar-banner.scss';

export default function SidebarBannerTemplate( { icon, CTA, message, onClick, trackImpression } ) {
	return (
		<div className="sidebar-banner">
			{ trackImpression && trackImpression() }
			<a className="sidebar-banner__link" onClick={ onClick } href={ CTA.link }>
				<span className="sidebar-banner__icon-wrapper">
					<Gridicon className="sidebar-banner__icon" icon={ icon || 'info-outline' } size={ 18 } />
				</span>
				<span className="sidebar-banner__content">
					<span className="sidebar-banner__text">{ message }</span>
				</span>
				<span className="sidebar-banner__cta">{ CTA.message }</span>
			</a>
		</div>
	);
}
