/**
 * External dependencies
 */

import React from 'react';

const SidebarHeading = ( { children, onClick, ...extraProps } ) => {
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
		<h2
			tabIndex={ tabIndex }
			className="sidebar__heading"
			onKeyDown={ onKeyDown }
			onClick={ onClick }
			{ ...extraProps }
		>
			{ children }
		</h2>
	);
};

export default SidebarHeading;
