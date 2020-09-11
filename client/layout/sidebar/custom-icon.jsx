/**
 * SidebarCustomIcon -
 *   Renders an <img> tag with props supplied, but adds
 *   className="sidebar__menu-icon" to the supplied className.
 *
 *   Purpose: To display a custom icon in the sidebar when using a
 *   source other than grid icons or material icons.
 **/

/**
 * External dependencies
 */

import React from 'react';
const SidebarCustomIcon = ( props ) => {
	const { alt, className, ...rest } = props;
	return (
		<img alt={ alt || '' } className={ 'sidebar__menu-icon ' + ( className || '' ) } { ...rest } />
	);
};
export default SidebarCustomIcon;
