/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MasterbarLoggedOut from 'layout/masterbar/logged-out';

const LayoutLoggedOutDesign = () => (
	<div className="wp is-section-design has-no-sidebar">
		<MasterbarLoggedOut />
		<div id="content" className="wp-content">
			<div id="primary" className="wp-primary wp-section" />
			<div id="secondary" className="wp-secondary" />
		</div>
		<div id="tertiary" className="wp-overlay fade-background" />
	</div>
)

LayoutLoggedOutDesign.displayName = 'LayoutLoggedOutDesign';

export default LayoutLoggedOutDesign;
