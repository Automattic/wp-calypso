/**
 * External dependencies
 */
import React from 'react';

// Prevents the event from bubbling up the DOM tree
const stopPropagation = ( event ) => event.stopPropagation();

export default function SelectDropdownLabel( { children } ) {
	return (
		<li onClick={ stopPropagation } role="presentation" className="select-dropdown__label">
			<label>{ children }</label>
		</li>
	);
}
