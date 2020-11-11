/**
 * External dependencies
 */

import React from 'react';

const SidebarHeading = ( { children, onClick, ...props } ) => {
	const tabIndex = onClick ? 0 : -1;

	let onKeyDown = null;

	if ( onClick ) {
		onKeyDown = ( event ) => {
			// Trigger click for enter, similarly to default brower behavior for <a> or <button>
			if ( 13 === event.keyCode ) {
				event.preventDefault();
				onClick();
			}
		};
	}

	/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
	return (
		<li>
			<h2
				tabIndex={ tabIndex }
				className="sidebar__heading"
				onKeyDown={ onKeyDown }
				onClick={ onClick }
				{ ...props }
			>
				{ children }
			</h2>
		</li>
	);
};

export default SidebarHeading;
