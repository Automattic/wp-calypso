/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

const SidebarRegion = ( { children, className } ) => (
	<div className={ classNames( 'sidebar__region', className ) }>{ children }</div>
);

export default SidebarRegion;
