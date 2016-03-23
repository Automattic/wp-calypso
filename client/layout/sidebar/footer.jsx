/**
 * External dependencies
 */
import React from 'react';

const SidebarFooter = ( { children, onClick } ) => (
	<ul className="sidebar__footer" onClick={ onClick }>{ children }</ul>
);

export default SidebarFooter;
