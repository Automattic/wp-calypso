/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */

const BrowserFrame = ( { children } ) => {
	return (
		<div className="browser-frame">
			<div className="browser-frame__title-bar">
				<div className="browser-frame__title-bar-button" />
				<div className="browser-frame__title-bar-button" />
				<div className="browser-frame__title-bar-button" />
			</div>
			<div className="browser-frame__document">{ children }</div>
		</div>
	);
};

export default BrowserFrame;
