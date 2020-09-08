/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import config from 'config';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Remove after checking in calypso live
 */
config.isEnabled( 'nav-unification' )
	? console.log( 'nav-unification feature: Enabled' )
	: console.log( 'nav-unification feature: Disabled' );

const Masterbar = ( { children, className } ) => (
	<header id="header" className={ classNames( 'masterbar', className ) }>
		{ children }
	</header>
);

Masterbar.propTypes = {
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};

export default Masterbar;
