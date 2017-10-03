/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

const Masterbar = ( { children } ) => (
	<header id="header" className="masterbar">
		{ children }
	</header>
);

Masterbar.displayName = 'Masterbar';

Masterbar.propTypes = {
	children: PropTypes.node.isRequired
};

export default Masterbar;
