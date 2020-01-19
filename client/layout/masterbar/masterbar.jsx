/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const Masterbar = ( { children } ) => (
	<header id="header" className="masterbar">
		{ children }
	</header>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

Masterbar.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Masterbar;
