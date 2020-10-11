/**
 * MySitesSidebarUnifiedSwitcher
 *   This is a development component to make comparing the prod and unified sidebars easier.
 *   Click the link to switch between the two versions of the sidebar.
 *
 *    Currently experimental/WIP.
 **/

/**
 * External dependencies
 */
import React, { useState } from 'react';
import MySitesSidebarUnified from './index';
import MySitesSidebar from '../sidebar/index';

export const MySitesSidebarUnifiedSwitcher = ( props ) => {
	const [ isUnified, setUnified ] = useState( true );

	return (
		<>
			<div
				className="sidebar-unified__switcher"
				role="link"
				tabIndex={ 0 }
				onClick={ () => setUnified( ! isUnified ) }
				onKeyDown={ () => setUnified( ! isUnified ) }
			>
				{ isUnified && <span>Unified SB</span> }
				{ ! isUnified && <span>Prod SB</span> }
			</div>
			{ isUnified && <MySitesSidebarUnified { ...props } /> }
			{ ! isUnified && <MySitesSidebar { ...props } /> }
		</>
	);
};
export default MySitesSidebarUnifiedSwitcher;
