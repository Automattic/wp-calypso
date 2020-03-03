/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SkipNavigation from './skip-navigation';

const SidebarRegion = ( { children, className } ) => (
	<div className={ classNames( 'sidebar__region', className ) }>
		<SkipNavigation skipToElementId="primary" />
		{ children }
	</div>
);

export default SidebarRegion;
