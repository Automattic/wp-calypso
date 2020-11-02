/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props {
	children: React.ReactNode;
	columnCount: 1 | 2;
}

const MenuAndContentLayout: React.FunctionComponent< Props > = ( { columnCount, children } ) => {
	if ( columnCount === 1 ) {
		return <div>{ children }</div>;
	}
	if ( Array.isArray( children ) ) {
		return (
			<div className="menu-and-content-layout__wrapper">
				<div className="menu-and-content-layout__menu">{ children[ 0 ] }</div>
				<div className="menu-and-content-layout__content">{ children.slice( 1 ) }</div>
			</div>
		);
	}
	return null;
};

export default MenuAndContentLayout;
