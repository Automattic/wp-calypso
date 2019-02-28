/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './heading.scss';

const SidebarHeading = ( { children, onClick } ) => (
	/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
	<h2 className="sidebar__heading" onClick={ onClick }>
		{ children }
	</h2>
	/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
);

export default SidebarHeading;
