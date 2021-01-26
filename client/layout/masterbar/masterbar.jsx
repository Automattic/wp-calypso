/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { isWpMobileApp } from 'calypso/lib/mobile-app';

/**
 * Style dependencies
 */
import './style.scss';

const Masterbar = ( { children, className } ) => {
	return isWpMobileApp() ? null : (
		<header id="header" className={ classNames( 'masterbar', className ) }>
			{ children }
		</header>
	);
};

Masterbar.propTypes = {
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};

export default Masterbar;
