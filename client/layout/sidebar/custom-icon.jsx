/**
 * SidebarCustomIcon -
 *   Handles Dashicons, SVGs, or image URLs and passes on the supplied props.
 *   Returns a blank SVG, if icon is not supplied or undefined.
 *   Adds className="sidebar__menu-icon" to the supplied className.
 *
 *   Purpose: To display a custom icon in the sidebar when using a
 *   source other than grid icons or material icons.
 **/

/**
 * External dependencies
 */
import React from 'react';

const blankSvg =
	"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";
const blankSvgStyle = { height: '20px', width: '20px' };

const SidebarCustomIcon = ( { alt, className, icon, ...rest } ) => {
	if ( ! icon ) {
		return (
			<img
				alt={ alt || '' }
				className={ 'sidebar__menu-icon ' + ( className || '' ) }
				src={ blankSvg }
				style={ blankSvgStyle }
				{ ...rest }
			/>
		);
	}
	if ( icon.indexOf( 'data:image' ) === 0 || icon.indexOf( 'http' ) === 0 ) {
		return (
			<img
				alt={ alt || '' }
				className={ 'sidebar__menu-icon ' + ( className || '' ) }
				src={ icon }
				{ ...rest }
			/>
		);
	}

	return <span className={ 'sidebar__menu-icon dashicons-before ' + icon } { ...rest }></span>;
};
export default SidebarCustomIcon;
