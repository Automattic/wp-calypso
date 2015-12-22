/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

const Masterbar = ( { collapsible, children } ) => {
	const classes = classNames( 'masterbar', { collapsible } );

	return (
		<header id="header" className={ classes }>
			{ children }
		</header>
	);
};

Masterbar.displayName = 'Masterbar';

Masterbar.propTypes = {
	collapsible: React.PropTypes.bool,
	children: React.PropTypes.element
};

export default Masterbar;
