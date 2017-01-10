/**
 * External Dependencies
 */
import React from 'react';

/**
 * Module variables
 */

/**
 * Prevents the event from bubbling up the DOM tree
 * @param {SyntheticEvent} event - Browser's native event wrapper
 * @return {void}
 */
const stopPropagation = event => event.stopPropagation();

export default function SelectDropdownLabel( props ) {
	return (
		<li
			onClick= { stopPropagation }
			className="select-dropdown__label"
		>
			<label>{ props.children }</label>
		</li>
	);
}
