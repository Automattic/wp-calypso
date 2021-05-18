/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

const Masterbar = ( { children, className } ) => (
	<header id="header" className={ classNames( 'masterbar', className ) }>
		{ children }
	</header>
);

Masterbar.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
};

export default Masterbar;
