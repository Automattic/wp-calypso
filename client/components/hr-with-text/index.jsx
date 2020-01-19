/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

const HrWithText = ( { children } ) => (
	<div className="hr-with-text">
		<div>{ children }</div>
	</div>
);

export default HrWithText;
