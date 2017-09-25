/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

const SidebarRegion = ( { children, className } ) => (
	<div className={ classNames( 'sidebar__region', className ) }>{ children }</div>
);

export default SidebarRegion;
