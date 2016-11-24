/**
 * External dependencies
 */
import React from 'react';

const Masterbar = ( { children } ) => (
	<header id="header" className="masterbar">
		{ children }
	</header>
);

Masterbar.displayName = 'Masterbar';

Masterbar.propTypes = {
	children: React.PropTypes.node.isRequired
};

export default Masterbar;
