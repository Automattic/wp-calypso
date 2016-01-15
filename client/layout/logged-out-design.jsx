/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MasterbarMinimal from 'layout/masterbar/minimal';
import ThemesHead from 'my-sites/themes/head';

const LayoutLoggedOutDesign = ( { tier = 'all' } ) => (
	<div className="wp is-section-design has-no-sidebar">
		<ThemesHead tier={ tier } />
		<MasterbarMinimal url="/" />
		<div id="content" className="wp-content">
			<div id="primary" className="wp-primary wp-section" />
			<div id="secondary" className="wp-secondary" />
		</div>
		<div id="tertiary" className="wp-overlay fade-background" />
	</div>
)

LayoutLoggedOutDesign.displayName = 'LayoutLoggedOutDesign';
LayoutLoggedOutDesign.propTypes = {
	tier: React.PropTypes.string
}

export default LayoutLoggedOutDesign;
