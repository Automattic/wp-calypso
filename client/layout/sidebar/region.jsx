/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

const SidebarRegion = ( { children, className } ) => (
	<li className={ classNames( 'sidebar__region', className ) }><ul>{ children }</ul></li>
);

export default SidebarRegion;
