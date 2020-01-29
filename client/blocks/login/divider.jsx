/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './divider.scss';

export default function Divider( { children } ) {
	return (
		<div className="login__divider">
			<span>{ children }</span>
		</div>
	);
}
