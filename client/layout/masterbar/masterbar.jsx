/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

const Masterbar = ( { children, className } ) => (
	<header id="header" className={ classNames( 'masterbar', className ) }>
		{ children }
	</header>
);

Masterbar.displayName = 'Masterbar';

Masterbar.propTypes = {
	children: React.PropTypes.node.isRequired
};

export default Masterbar;
