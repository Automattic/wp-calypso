/**
 * External dependencies
 */
import React from 'react';

const SidebarHeading = ( { children, onClick } ) => (
	<h2 className="sidebar__heading" onClick={ onClick }>{ children }</h2>
);

export default SidebarHeading;
