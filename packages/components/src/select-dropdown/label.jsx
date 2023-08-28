import { FormLabel } from '../forms';

// Prevents the event from bubbling up the DOM tree
const stopPropagation = ( event ) => event.stopPropagation();

export default function SelectDropdownLabel( { children } ) {
	return (
		<li onClick={ stopPropagation } role="presentation" className="select-dropdown__label">
			<FormLabel>{ children }</FormLabel>
		</li>
	);
}
