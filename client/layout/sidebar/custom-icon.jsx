/**
 * External dependencies
 */

import React from 'react';
const SidebarCustomIcon = ( props ) => {
	const { alt, className, ...rest } = props;
	return (
		<img
			alt={ alt != null ? alt : '' }
			className={ 'sidebar__menu-icon ' + ( className != null ? className : '' ) }
			{ ...rest }
		/>
	);
};
export default SidebarCustomIcon;
