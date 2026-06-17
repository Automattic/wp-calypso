import React from 'react';
/**
 * SidebarCustomIcon -
 *   Handles Dashicons, SVGs, React components, or image URLs and passes on the supplied props.
 *   Returns null if icon is not supplied or undefined.
 *   Adds className="sidebar__menu-icon" to the supplied className.
 *
 *   Purpose: To display a custom icon in the sidebar when using a
 *   source other than grid icons or material icons.
 */

const SidebarCustomIcon = ( { icon, ...rest } ) => {
	if ( ! icon ) {
		return null;
	}

	if ( React.isValidElement( icon ) ) {
		return icon;
	}

	if ( icon.indexOf( 'data:image' ) === 0 || icon.indexOf( 'http' ) === 0 ) {
		const isSVG = icon.indexOf( 'data:image/svg+xml' ) === 0;
		const imgStyle = `url("${ icon }")`;
		const imgStyles = {
			backgroundImage: imgStyle,
			...( isSVG ? { maskImage: imgStyle, WebkitMaskImage: imgStyle } : {} ),
		};

		return (
			<span
				className={ 'sidebar__menu-icon dashicons' + ( isSVG ? ' sidebar__menu-icon-img' : '' ) }
				aria-hidden
				{ ...rest }
				style={ imgStyles }
			/>
		);
	}

	return (
		<span className={ 'sidebar__menu-icon dashicons-before ' + icon } aria-hidden { ...rest } />
	);
};
export default SidebarCustomIcon;
