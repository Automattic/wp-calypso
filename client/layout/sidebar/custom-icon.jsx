/**
 * SidebarCustomIcon -
 *   Handles Dashicons, SVGs, or image URLs and passes on the supplied props.
 *   Returns null if icon is not supplied or undefined.
 *   Adds className="sidebar__menu-icon" to the supplied className.
 *
 *   Purpose: To display a custom icon in the sidebar when using a
 *   source other than grid icons or material icons.
 **/

/**
 * External dependencies
 */
import React from 'react';

const SidebarCustomIcon = ( { icon, ...rest } ) => {
	if ( ! icon ) {
		return null;
	}

	if ( icon.indexOf( 'data:image' ) === 0 || icon.indexOf( 'http' ) === 0 ) {
		const imgStyle = `url("${ icon }")`;
		const imgStyles = { backgroundImage: imgStyle, maskImage: imgStyle };

		return (
			<span
				className={ 'sidebar__menu-icon dashicons sidebar__menu-icon-img' }
				style={ imgStyles }
				{ ...rest }
			></span>
		);
	}

	return <span className={ 'sidebar__menu-icon dashicons-before ' + icon } { ...rest }></span>;
};
export default SidebarCustomIcon;
